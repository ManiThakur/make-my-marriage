import { randomBytes } from "node:crypto";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db/connect";
import { apiError, internalError } from "@/lib/http/api-response";
import { getAuthContext, hashOpaqueToken } from "@/modules/auth/service";
import { WeddingMembership } from "@/modules/auth/models";
import { Wedding } from "@/modules/weddings/model";

const schema = z.object({
  brideName: z.string().trim().min(1).max(80),
  groomName: z.string().trim().min(1).max(80),
  title: z.string().trim().max(180).optional().or(z.literal("")),
  weddingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  city: z.string().trim().min(1).max(120),
  state: z.string().trim().max(120).optional().or(z.literal("")),
  country: z.string().trim().max(120).optional().or(z.literal("")),
});

function makeBaseSlug(bride: string, groom: string, date: string) {
  const names = `${bride}-${groom}`.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const [year, month, day] = date.split("-");
  return `${names || "wedding"}-${day}${month}${year}`;
}

export async function POST(request: Request) {
  let createdWeddingId: string | undefined;
  let createdMembership = false;
  try {
    const context = await getAuthContext();
    if (!context) return apiError(401, "UNAUTHORIZED", "Please sign in to set up your wedding.");
    if (context.membership) return apiError(409, "ALREADY_HAS_WEDDING", "Your account is already connected to a wedding.");

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return apiError(400, "VALIDATION_ERROR", "Add both names, a wedding date, and the city where you’ll celebrate.");
    const { brideName, groomName, title, weddingDate, city, state, country } = parsed.data;
    const [year, month, day] = weddingDate.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
      return apiError(400, "VALIDATION_ERROR", "Choose a real calendar date.");
    }

    await connectToDatabase();
    const galleryToken = randomBytes(32).toString("base64url");
    const baseSlug = makeBaseSlug(brideName, groomName, weddingDate);
    let slug = baseSlug;
    for (let suffix = 2; await Wedding.exists({ "website.slug": slug }); suffix += 1) slug = `${baseSlug}-${suffix}`;

    const wedding = await Wedding.create({
      brideName,
      groomName,
      ...(title ? { title } : {}),
      weddingDate,
      timeZone: "Asia/Kolkata",
      location: { city, ...(state ? { state } : {}), ...(country ? { country } : {}), formattedAddress: [city, state, country].filter(Boolean).join(", ") },
      website: { slug, theme: "botanical", isPublished: false },
      gallery: { tokenHash: hashOpaqueToken(galleryToken), isEnabled: false, guestUploadsEnabled: false },
      livestream: { isEnabled: false },
      createdByUserId: context.user._id,
      deletedAt: null,
    });
    createdWeddingId = wedding.id;
    await WeddingMembership.create({ userId: context.user._id, weddingId: wedding._id, role: "ADMIN", joinedAt: new Date() });
    createdMembership = true;
    return Response.json({ data: {
      id: wedding.id,
      brideName: wedding.brideName,
      groomName: wedding.groomName,
      weddingDate: wedding.weddingDate,
      location: wedding.location,
      website: { slug },
    } }, { status: 201 });
  } catch (error) {
    if (createdMembership && createdWeddingId) await WeddingMembership.deleteOne({ weddingId: createdWeddingId }).catch(() => undefined);
    if (createdWeddingId) await Wedding.deleteOne({ _id: createdWeddingId }).catch(() => undefined);
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      return apiError(409, "ALREADY_HAS_WEDDING", "Your account is already connected to a wedding.");
    }
    console.error("Wedding creation failed", error);
    return internalError();
  }
}

const detailsSchema = z.object({
  brideName: z.string().trim().min(1).max(80),
  groomName: z.string().trim().min(1).max(80),
  weddingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  city: z.string().trim().min(1).max(120),
  state: z.string().trim().max(120).optional().or(z.literal("")),
  country: z.string().trim().max(120).optional().or(z.literal("")),
  venue: z.string().trim().max(160).optional().or(z.literal("")),
  title: z.string().trim().max(180).optional().or(z.literal("")),
  updatedAt: z.string().datetime(),
});

export async function PATCH(request: Request) {
  try {
    const context = await getAuthContext();
    if (!context) return apiError(401, "UNAUTHORIZED", "Please sign in to update your wedding details.");
    if (!context.wedding || !context.membership) return apiError(404, "WEDDING_NOT_FOUND", "Your wedding workspace could not be found.");
    if (context.membership.role !== "ADMIN") return apiError(403, "FORBIDDEN", "Only a wedding admin can update these details.");

    let body: unknown;
    try { body = await request.json(); }
    catch { return apiError(400, "VALIDATION_ERROR", "Send valid wedding details."); }

    const parsed = detailsSchema.safeParse(body);
    if (!parsed.success) return apiError(400, "VALIDATION_ERROR", "Check the names, date, and destination and try again.");
    const { brideName, groomName, weddingDate, city, state, country, venue, title, updatedAt } = parsed.data;
    if (weddingDate) {
      const [year, month, day] = weddingDate.split("-").map(Number);
      const date = new Date(Date.UTC(year, month - 1, day));
      if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
        return apiError(400, "VALIDATION_ERROR", "Choose a real calendar date or select that you have not set a new date yet.");
      }
    }

    await connectToDatabase();
    const expectedUpdatedAt = new Date(updatedAt);
    const wedding = await Wedding.findOneAndUpdate(
      { _id: context.wedding._id, deletedAt: null, updatedAt: expectedUpdatedAt },
      {
        $set: {
          brideName,
          groomName,
          weddingDate,
          "location.city": city,
          "location.state": state || "",
          "location.country": country || "",
          "location.venue": venue || "",
          "location.formattedAddress": [venue, city, state, country].filter(Boolean).join(", "),
          title: title || "",
        },
      },
      { new: true, runValidators: true },
    ).lean();

    if (!wedding) return apiError(409, "WEDDING_DETAILS_CHANGED", "These wedding details were changed in another session. Refresh and try again.");
    return Response.json({ data: {
      brideName: wedding.brideName,
      groomName: wedding.groomName,
      weddingDate: wedding.weddingDate ?? null,
      location: wedding.location,
      title: wedding.title ?? "",
      updatedAt: wedding.updatedAt instanceof Date ? wedding.updatedAt.toISOString() : new Date(wedding.updatedAt ?? Date.now()).toISOString(),
    } });
  } catch (error) {
    console.error("Wedding details update failed", error);
    return internalError();
  }
}

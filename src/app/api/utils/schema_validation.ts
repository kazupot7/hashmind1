import zod from "zod";

export const updateBlogStyleSchema = zod.object({
  gpt_style: zod.string(),
  is_author: zod.boolean(),
  author_name: zod.string().optional(),
});

export const pubPreferenceSchema = zod.object({
  preference: zod.enum(["draft", "publish"]),
});

export const updateHashnodeTokenSchema = zod.object({
  token: zod.string(),
});

export const handleUserRequestSchema = zod.object({
  audio_base64: zod.string()
})
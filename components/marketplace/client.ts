export async function api(
  action: string,
  values: Record<string, unknown> = {},
) {
  const response = await fetch("/api/marketplace", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...values }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
}
export async function photo(file: File | undefined): Promise<string> {
  if (!file) return "";
  if (
    file.size > 2000000 ||
    !["image/jpeg", "image/png", "image/webp"].includes(file.type)
  )
    throw new Error("Use a JPG, PNG or WebP photo under 2 MB.");
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read photo."));
    reader.readAsDataURL(file);
  });
}

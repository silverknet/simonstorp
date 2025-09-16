export const getCategoryFromPage = (pages, pageID) => {
    const page = pages.find((p) => p.id === pageID);
    const categories = page?.attributes?.categories?.data;
    if (categories && categories.length > 0) {
        return categories[0].id;
    }
    return null;
};

export function toValidUrl(input) {
  return String(input)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")  
    .replace(/[^a-zA-Z0-9]/g, "")    
    .toLowerCase();
}
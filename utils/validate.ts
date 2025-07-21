export const validateCollectionName = (name: string, existingNames: string[]) => {
    if (!name) return 'Collection name is required.';
    if (!/^[a-zA-Z0-9 ]+$/.test(name)) return 'No special characters allowed.';
    if (existingNames.includes(name)) return 'Collection name must be unique.';
    return '';
};
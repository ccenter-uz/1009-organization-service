export function formatLanguageResponse(translation: { languageCode: string, name: string }[]) {
  let name = translation.reduce((acc, translation) => {
    acc[translation.languageCode] = translation.name;

    return acc;
  }, {});

  if (Object.keys(name).length === 1) {
    name = Object.values(name)[0];
  }

  return name
}
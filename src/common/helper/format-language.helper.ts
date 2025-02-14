export function formatLanguageResponse(translation: { languageCode: string, name: string }[]) {
  
  console.log("INPUT:",translation);

  let name = translation.reduce((acc, translation) => {
    acc[translation.languageCode] = translation.name;

    return acc;
  }, {});
  console.log("BEFOREEE:",name);

  if (Object.keys(name).length === 1) {
    name = Object.values(name)[0];
  }
  console.log("ABEFOREEE:",name);
  
  return name
}
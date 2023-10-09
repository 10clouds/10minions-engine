export function createFullPromptFromSections({
  intro,
  outro,
  sections,
  sectionMarker = '====',
}: {
  intro: string;
  outro?: string;
  sections: { [key: string]: string };
  sectionMarker?: string;
}) {
  // Remove section markers from intro and outro
  const cleanedIntro = intro.replaceAll(sectionMarker, '');
  const cleanedOutro = outro?.replaceAll(sectionMarker, '');

  // Remove section markers from each section
  const cleanedSections = Object.fromEntries(Object.entries(sections).map(([name, section]) => [name, section.replaceAll(sectionMarker, '')]));

  // Create the full prompt
  const sectionPrompts = Object.entries(cleanedSections)
    .map(([name, section]) => {
      return `
        ${sectionMarker} ${name} ${sectionMarker}
        ${section}`.trim();
    })
    .join('\n\n');

  return `
  ${cleanedIntro}

  ${sectionPrompts}

  ${cleanedOutro ?? ''}`.trim();
}



export function createFullPromptFromSections({
  intro, outro, sections, sectionMarker = '====',
}: {
  intro: string;
  outro?: string;
  sections: { [key: string]: string; };
  sectionMarker?: string;
}) {
  //replace all section markers in intro, sections and outro
  intro = intro.replace(new RegExp(sectionMarker, 'g'), '');
  outro = outro?.replace(new RegExp(sectionMarker, 'g'), '');
  sections = Object.fromEntries(Object.entries(sections).map(([name, section]) => [name, section.replace(new RegExp(sectionMarker, 'g'), '')]));

  return `
${intro}

${Object.entries(sections)
      .map(([name, section]) => {
        return `
${sectionMarker} ${name} ${sectionMarker}
${section}
`.trim();
      })
      .join('\n\n')}


${outro ?? ''}
`.trim();
}

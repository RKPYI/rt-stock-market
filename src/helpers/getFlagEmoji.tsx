export const getFlagEmoji = (code: string) =>
  code
    .toUpperCase()
    .replace(/./g, char => 
      String.fromCodePoint(127397 + char.charCodeAt(0))
    )
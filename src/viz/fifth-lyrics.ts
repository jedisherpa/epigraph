const LINES: Array<{ start: number; end: number; text: string }> = [
  { start: 3, end: 8, text: "Yeah." },
  { start: 8, end: 11, text: "Slay." },
  { start: 11, end: 16, text: "The whiskey’s whispering geometry again." },
  { start: 16, end: 36, text: "I’m writing to the ghost of a friend. The universe ain’t what we thought it was." },
  { start: 36, end: 45, text: "Yeah." },
  { start: 45, end: 52, text: "Read the paper. Saw the fifth dimension bleeding through the seams." },
  { start: 52, end: 58, text: "Newton was an alchemist, turning gravity into a spiritual machine." },
  { start: 58, end: 71, text: "DNA and ballet. Photosynthesis dancing quantum in broad day." },
  { start: 71, end: 83, text: "The truth is humming low, like a monk in the sun. Resonance, coherence, consciousness, one." },
  { start: 83, end: 95, text: "We just echoes of the fifth. Can’t you feel the shift? Light is just a myth, with a halo and a glitch." },
  { start: 95, end: 103, text: "Fractals in the flesh, hiding in the twist. Every breath a message that the atom can’t resist." },
  { start: 103, end: 109, text: "They say I’m crazy ’cause I talk like space is breathing." },
  { start: 109, end: 116, text: "Faith ain’t religion. It’s the science of believing." },
  { start: 116, end: 122, text: "Now they got us smashing atoms, burning cash to chase the ghost." },
  { start: 122, end: 129, text: "The truth’s inside your body. Order without spirit is a jail without a post." },
  { start: 129, end: 137, text: "Talking to the fifth dimension. Every thought a frequency." },
  { start: 137, end: 145, text: "The hum behind the hum. The light that don’t need the sun." },
  { start: 145, end: 151, text: "The temple was a collider. The monk was a scientist." },
  { start: 151, end: 156, text: "The gospel was geometry. And the choir sings in silence." },
  { start: 156, end: 162, text: "We ain’t climbing up the ladder. We’re unfolding what we be." },
  { start: 162, end: 172, text: "You ain’t small. You infinite. The fifth dimension breathing through your empathy." },
  { start: 172, end: 184, text: "The truth don’t care. It’ll bleed through anywhere." },
  { start: 184, end: 195, text: "We just echoes of the fifth. Matter’s just a myth, with a halo and a glitch." },
  { start: 195, end: 204, text: "Fractals in the flesh. God hiding in the twist." },
  { start: 204, end: 214, text: "If the fifth dimension calls, tell it I’m not done drinking yet." },
  { start: 214, end: 223, text: "Reality’s just a letter we ain’t finished writing. And the ink is made of us." },
];

export function fifthCaption(seconds: number): string {
  const line = LINES.find((item) => seconds >= item.start && seconds < item.end);
  return line?.text ?? "";
}

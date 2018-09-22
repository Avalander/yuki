const MAGIC = [
    "The caster takes a number of points of ability damage to his casting stat equal to the effect’s caster level/4 (minimum 1) even if he would normally be immune to ability damage.",
    "All creatures within close range of the caster must succeed on a Reflex save or become entangled by plants, shifting rocks, or ice as appropriate to the environment for 1d6 rounds.",
    "For 1 hour per level, the caster gains the Draining Casting drawback, but not its benefits."
]


module.exports = (text, message) => {
    text = text.toLowerCase();
    if (text.startsWith('wild')) {
        var magic = Math.floor(Math.random() * MAGIC.length);
        return message.channel.send(MAGIC[magic]);
    }
}

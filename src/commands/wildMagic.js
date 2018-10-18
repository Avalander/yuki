const MAGIC = [
    'Target affected by *slow* for 10 rounds (Will DC 15 negates).',
    '*Faerie fire* surrounds the target.',
    'Deludes the caster for 1 round into believing the effect functions as normal, but doesn\'t (no save).',
    '*Gust of wind*, but at windstorm force (Fortitude DC 14 negates).',
    'Caster learns the target\'s surface thoughts (as with *detect thoughts*) for 1d4 rounds (no save).',
    '*Stinking cloud* appears at 30-foot range (Fortitude DC 15 negates).',
    'Heavy rain falls for 1 round in 60-foot radius centered on the caster.',
    'Summons an animal—a rhino (01—25 on d%), elephant (26—50), or mouse (51—100).',
    '*Lightning bolt* (70 foot long, 5 foot wide), 6d6 points of damage (Reflex DC 15 half).',
    'A stream of 600 large butterflies pours forth and flutters around for 2 rounds, blinding everyone within 25 feet (Reflex DC 14 negates).',
    'Target is affected by *enlarge person* if within 60 feet of caster (Fortitude DC 13 negates).',
    '*Darkness*, 30-foot-diameter hemisphere, centered 30 feet away from the caster.',
    'Grass grows in 160-square-foot area before the caster, or grass existing there grows to 10 times its normal size.',
    'Any nonliving object of up to 1,000 pounds of mass and up to 30 cubic feet in size turns ethereal.',
    'Reduce caster\'s size two size categories (no save) for 1 day.',
    '*Fireball* at target or 100 feet straight ahead, 6d6 points of damage (Reflex DC 15 half).',
    'The caster becomes invisible (as *invisibility*).',
    'Leaves grow from the target if within 60 feet of the caster. These last 24 hours.',
    '10—40 gems, value 1 gp each, shoot forth in a 30-foot-long stream. Each gem deals 1 point of damage to any creature in its path: roll 5d4 for the number of hits and divide them among the available targets.',
    'Shimmering colors dance and play over a 40-foot-by-30-foot area in front of the caster. Creatures therein are blinded for 1d6 rounds (Fortitude DC 15 negates).',
    'The caster turns blue, green, or purple for 1 day (no save).',
    'The target turns blue, green, or purple for 1 day (no save).',
    '*Flesh to stone* (or *stone to flesh* if the target is stone already) if the target is within 60 feet (Fortitude DC 18 negates).'
]

const wildChance = 10;

function rollTable (table) {
    let result = Math.floor(Math.random() * table.length);
    return table[result];
}

function rollWildMagic (magicKind, text = wildChance) {
    let itHappens = Math.floor(Math.random() * 100);
    let result;
    let chance;
    const regEx = /\d+\%/;
    if (regEx.test(text)) chance = parseInt(/(\d+)\%/.exec(text));
    else chance = wildChance;
    if (itHappens < chance) {
        result = 'Oops, something funny\'s going on.\n';
        switch (magicKind) {
            default:
                result += rollTable(MAGIC);
                break;
        }
    }else{
        result = 'You\'re good, nothing weird happens.';
    }
    return result;
}

module.exports = (text, message) => {
    text = text.toLowerCase();

    if (text.startsWith('wild')) return message.channel.send(rollWildMagic('MAGIC', text));
}

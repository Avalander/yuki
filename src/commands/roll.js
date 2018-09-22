const RESPONSES = ['I rolled ', 'Here it is: ', 'Okay. ', 'There you go: '];

function roll (n, dice){
    if (dice == 'F') {
        return Math.floor(Math.random() * 3) -1 ;
    }else{
        return Math.floor(Math.random() * dice) + 1;
    }
}

module.exports = (text, message) => {
    if (text.includes('roll')) {
        const [ _, n, dice ] = text.match(/(\d)d(\d+|F)/)
        let total = 0;
        let rolls = new Array;
        for (let i=n;i>=1;i--) {
            let result = roll(n, dice);
            total += result;
            rolls.push(result);
        }
        let result = total;
        if (n > 1) result += ' (' + rolls.join() + ')';
        var response = Math.floor(Math.random() * RESPONSES.length);
        return message.channel.send(RESPONSES[response] + result)
    }
}

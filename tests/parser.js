// @ts-check

const { Parser, Util, Time, CustomParser } = require('..');

/**
 * Parser code to test the parser.
 */
const ParserCode = `
{newEmbed:{title:Hello World!}{description:This is a test embed}{color:Red}{footer:This is a footer}{timestamp:1698888888}}
{actionRow:{button:Click me!:1:customId:false:♥️}}
{actionRow:{selectMenu:customid:placeholder:1:1:false:{stringInput:Option 1:1:This is option 1:true:🐐}}}
{flags:4096}
{poll:This is a poll:1d:true:{answer:Option 1}{answer:Option 2}}
{allowedMentions:users:roles:everyone}
{reply:123456789012345678:true}
`;

/**
 * This function is used to test the parser.
 */
async function main() {
    const ctx = {
        util: Util,
        helpers: {
            time: Time
        }
    };

    const start = performance.now();
    console.log('='.repeat(process.stdout.columns));
    console.log('\n');

    /**
     * Parse the parser code.
     */
    // @ts-ignore
    const data = await Parser(ctx, ParserCode);
    console.log(JSON.stringify(data, null, 2));

    console.log('\n');
    console.log('='.repeat(process.stdout.columns));
    console.log('\n');

    /**
     * Parse the parser code with custom parser.
     */
    const data2 = CustomParser('test', '{test:Hello World!}{test:Hello World 2!}', 0, true, 'normal');
    console.log(JSON.stringify(data2, null, 2));

    console.log('\n');
    console.log('='.repeat(process.stdout.columns));
    console.log(`Time taken: ${(performance.now() - start).toFixed(2)}ms`);
}

main();

import "dotenv/config"
import delay from 'delay'
import { createBot, createProvider, createFlow, addKeyword, EVENTS } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import { toAsk, httpInject } from "@builderbot-plugins/openai-assistants"
import { typing } from "./utils/presence"
import { enqueueMessage } from './utils/fast-entries'

const PORT = process.env?.PORT ?? 3008
const ASSISTANT_ID = process.env?.ASSISTANT_ID ?? ''


const mediaFlow = addKeyword(EVENTS.MEDIA).addAnswer('En este momento no puedo recibir imagen o video, me encantaría ayudarte pero porfa, envíame tus ideas por escrito!')

const mvoiceFlow = addKeyword(EVENTS.VOICE_NOTE).addAnswer('En este momento no puedo recibir audio, me encantaría ayudarte pero porfa, envíame tus ideas por escrito!')

const mdocumentFlow = addKeyword(EVENTS.DOCUMENT).addAnswer('En este momento no puedo recibir documentos, me encantaría ayudarte pero porfa, envíame tus ideas por escrito!')

const chatFlow = addKeyword<Provider, Database>(EVENTS.ACTION)
        .addAction( //esta acción es para escribiendo...
            {delay:2500},
            async(ctx,{provider}) =>{
                await typing(ctx, provider)
            }
        )
        .addAnswer('Chévere que estés por acá',{ delay: 3500 },async(ctx,{provider}) =>{
            await typing(ctx, provider)
        })
        .addAnswer('Cuéntame en un solo mensaje ¿qué te gustaría cocinar?',{ delay: 5000 },async(ctx,{provider}) =>{
            await typing(ctx, provider)
        })
        .addAction({delay: 2500 , capture: true},async (ctx, { flowDynamic, state, provider, gotoFlow, fallBack }) => {
            await delay(4000)
            await typing(ctx, provider)
            console.log(ctx.body);
            if (ctx.body==='out') {
                
                return gotoFlow(welcomeFlow)
            } else if (ctx.body.includes('_event_voice_note')) {
               await flowDynamic([{ body: 'En este momento no puedo recibir audio, me encantaría ayudarte pero porfa, envíame tus ideas por escrito!' }])
            } else if (ctx.body.includes('_event_media')) {
                await flowDynamic([{ body: 'En este momento no puedo recibir imagen o video, me encantaría ayudarte pero porfa, envíame tus ideas por escrito!' }])
             } else if (ctx.body.includes('_event_document')) {
                await flowDynamic([{ body: 'En este momento no puedo recibir documentos, me encantaría ayudarte pero porfa, envíame tus ideas por escrito!' }])
             } else if (ctx.body.toLocaleLowerCase().includes('masterchef') || ctx.body.toLocaleLowerCase().includes('MasterChef') || ctx.body.toLocaleLowerCase().includes('Master Chef')) {
                await flowDynamic([{ body: '¡Sigue atento al programa! ¿Qué receta quieres que preparemos para romperla hoy?' }])
             } 
            else{
                console.log('ingresé al chatGPT')
                const response = await toAsk(ASSISTANT_ID, ctx.body, state)
                const chunks = response.split(/\n\n+/);
                for (const chunk of chunks) {
                await flowDynamic([{ body: chunk.trim().replace(/【.*?】/g, "") }]);
                }
            }
            return fallBack('')
         })

// const welcomeFlow = addKeyword(EVENTS.WELCOME)
const welcomeFlow = addKeyword(['hola', 'como estás ?', 'holi','hol','ola','Hola','Hola Nico','Hola Nico, Cómo estás?','Hola Nico, como estás?','Hey Nico', 'Hola Nico', 'Qué tal, Nico', 'Saludos, Nico', 'Qué onda, Nico', 'Hola, hola', 'Qué hay, Nico', 'Hey', 'Qué más, Nico', 'Hola tú', 'Hola', 'Ey Nico', 'Qué pasa, Nico', 'Qué tal', 'Hola amigo', 'Hola compa', 'Qué hubo', 'Nico', 'Hola hermano', 'Buenas, Nico', 'Hola crack', 'Saludos', 'Hola bro', 'Qué hay', 'Hola colega', 'Ey', 'Qué cuenta, Nico', 'Hola campeón', 'Hola parcero', 'Qué rollo, Nico', 'Hola primo', 'Qué se dice, Nico', 'Hola genio', 'Hola jefe', 'Qué tal va, Nico', 'Hola fenómeno', 'Hola líder', 'Hola pana', 'Qué onda', 'Hola máquina', 'Hola compañero', 'Hola hermano', 'Hola colega', 'Qué tal todo, Nico', 'Hola figura', 'Hola campeón', 'Hola figura', 'Hola crack', 'Hola artista', 'Cómo estás', 'Qué tal', 'Qué hubo parce', 'Quiubo', 'Qué cuentas', 'Qué pasa', 'Hola pues', 'Qué más', 'Qué fue', 'Qué me dices', 'Qué hay de nuevo', 'Cómo va todo', '¿Hey Nico?', '¿Hola Nico?', '¿Qué tal, Nico?', '¿Saludos, Nico?', '¿Qué onda, Nico?', '¿Hola, hola?', '¿Qué hay, Nico?', '¿Hey?', '¿Qué más, Nico?', '¿Hola tú?', 'Hola?', 'Ey Nico?', '¿Qué pasa, Nico?', '¿Qué tal?', 'Hola amigo?', 'Hola compa?', '¿Qué hubo?', 'Nico?', 'Hola hermano?', '¿Buenas, Nico?', 'Hola crack?', '¿Saludos?', 'Hola bro?', '¿Qué hay?', 'Hola colega?', 'Ey?', '¿Qué cuenta, Nico?', 'Hola campeón?', 'Hola parcero?', '¿Qué rollo, Nico?', 'Hola primo?', '¿Qué se dice, Nico?', 'Hola genio?', 'Hola jefe?', '¿Qué tal va, Nico?', 'Hola fenómeno?', 'Hola líder?', 'Hola pana?', '¿Qué onda?', 'Hola máquina?', 'Hola compañero?', 'Hola hermano?', 'Hola colega?', '¿Qué tal todo, Nico?', 'Hola figura?', 'Hola campeón?', 'Hola figura?', 'Hola crack?', 'Hola artista?', '¿Cómo estás?', '¿Qué tal?', '¿Qué hubo parce?', '¿Quiubo?', '¿Qué cuentas?', '¿Qué pasa?', 'Hola pues?', '¿Qué más?', '¿Qué fue?', '¿Qué me dices?', '¿Qué hay de nuevo?', '¿Cómo va todo?', '¿Hey Nico?', '¿Hola Nico?', '¿Qué tal, Nico?', '¿Saludos, Nico?', '¿Qué onda, Nico?', '¿Hola, hola?', '¿Qué hay, Nico?', '¿Hey?', '¿Qué más, Nico?', '¿Hola tú?', '¿Hola?', '¿Ey Nico?', '¿Qué pasa, Nico?', '¿Qué tal?', '¿Hola amigo?', '¿Hola compa?', '¿Qué hubo?', '¿Nico?', '¿Hola hermano?', '¿Buenas, Nico?', '¿Hola crack?', '¿Saludos?', '¿Hola bro?', '¿Qué hay?', '¿Hola colega?', '¿Ey?', '¿Qué cuenta, Nico?', '¿Hola campeón?', '¿Hola parcero?', '¿Qué rollo, Nico?', '¿Hola primo?', '¿Qué se dice, Nico?', '¿Hola genio?', '¿Hola jefe?', '¿Qué tal va, Nico?', '¿Hola fenómeno?', '¿Hola líder?', '¿Hola pana?', '¿Qué onda?', '¿Hola máquina?', '¿Hola compañero?', '¿Hola hermano?', '¿Hola colega?', '¿Qué tal todo, Nico?', '¿Hola figura?', '¿Hola campeón?', '¿Hola figura?', '¿Hola crack?', '¿Hola artista?', '¿Cómo estás?', '¿Qué tal?', '¿Qué hubo parce?', '¿Quiubo?', '¿Qué cuentas?', '¿Qué pasa?', '¿Hola pues?', '¿Qué más?', '¿Qué fue?', '¿Qué me dices?', '¿Qué hay de nuevo?', '¿Cómo va todo?','Buenos días', 'Buenas tardes', 'Buenas', 'buenas', 'buen día', 'Buenas noches', 'buenos dias', 'buenas tardes'],{ sensitive: true})
    // .addAction(async(ctx) => {
    //     const body = await enqueueMessage(ctx.body) // all message merged!
    //     console.log(body)
    // })
    .addAnswer('Hola. Te cuento que este chat de WhatsApp tiene unas políticas de tratamiento de datos y privacidad de la información, si deseas hablar con el Chef Nico, por favor escribe Si', 
        { delay: 1000, capture: true },
        async (ctx, { fallBack, gotoFlow}) => {
            const body = await enqueueMessage(ctx.body) // all message merged!
            console.log('estoy en flow bienvenida')
            console.log(body);
            if (!body.toLocaleLowerCase().includes('si')) {
                return fallBack('No podemos continuar por políticas internas 😔; puedes escribir Si para comenzar a hablar con el Chef Nico')
            }
            return gotoFlow(chatFlow);
        }
    )  

const main = async () => {
    const adapterFlow = createFlow([welcomeFlow, chatFlow, mediaFlow, mvoiceFlow, mdocumentFlow])
    const adapterProvider = createProvider(Provider)
    const adapterDB = new Database()

    const { httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    httpInject(adapterProvider.server)
    httpServer(+PORT)
}

main()

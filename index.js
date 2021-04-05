const discord = require("discord.js");
const client = new discord.Client();
const db = require('quick.db');
const ms = require('parse-ms');

var userTickets = new Map();

client.on("ready", () => {
  client.user.setActivity("sua mãe na cama :)");
  console.log("ON")
});

client.on("message", async message => {

  const prefix = "i!";

  if(message.author.bot) return;
    if(message.channel.type === "dm") return;
    if(!message.content.toLowerCase().startsWith(prefix)) return;

    var comando = message.content.toLowerCase().split(" ")[0]
    comando = comando.slice(prefix.length)

    var args = message.content.split(" ").slice(1);

    try {
        var arquivoComando = require(`./comandos/${comando}.js`)
        arquivoComando.run(client, message, args);
    } catch (err) {
      message.channel.send(`:x: **»** ${message.author}, comando não encontrado!`)
      console.log(err)
      }
})

client.on("guildMemberAdd", (member) => {
  const guild = client.guilds.cache.get('828348207431548959')
  const c = guild.channels.cache.find(channel => channel.id === "828348207431548962").setTopic(`Total de invasores: ${guild.memberCount}!`)
})

client.on("guildMemberRemove", (member) => {
  const guild = client.guilds.cache.get('828348207431548959')
  const c = guild.channels.cache.find(channel => channel.id === "828348207431548962").setTopic(`Total de invasores: ${guild.memberCount}!`)
})

client.on('raw', async dados => {
    if(dados.t !== "MESSAGE_REACTION_ADD" && dados.t !== "MESSAGE_REACTION_REMOVE") return
    if(dados.d.message_id != "828384354971156532") return

    let servidor = client.guilds.cache.get("828348207431548959")
    let membro = servidor.members.cache.get(dados.d.user_id)

    if(dados.t === "MESSAGE_REACTION_ADD"){
        if(dados.d.emoji.name === "❌"){

          let cargo = servidor.roles.cache.get('828354168241651782')      

          if(membro.roles.has(cargo)) return client.cache.get('828365094458884108').send('a')

    if(userTickets.has(membro.id) || servidor.channels.cache.some(channel => channel.name.toLowerCase() === `verificação-${membro.id}`)) {
      client.channels.cache.get('828365094458884108').send(`:x: **»** ${membro}, você ja possui um canal de verificação aberto!`).then(a => {
        setTimeout(() => {
        a.delete()
        }, 8000)
      })
    } else {

      const timeout = 3.6e+6;

      const tempo = db.get(`tempo_${membro}`)

      if(tempo !== null && timeout - (Date.now() - tempo) > 0) {
      let time = ms(timeout - (Date.now() - tempo));

      client.channels.cache.get('828365094458884108').send(`:x: **»** ${membro}, você ainda tem que esperar ${time.hours} horas, ${time.minutes} minutos, ${time.seconds} segundos para enviar outra verificação!`)

      } else {

      servidor.channels.create(`verificação-${membro.id}`, { reason: 'verificação' } ).then(x => {
            x.updateOverwrite(membro.guild.roles.everyone, {VIEW_CHANNEL: false})
            x.updateOverwrite(membro, {VIEW_CHANNEL: true})
            x.updateOverwrite(client.user.id,{VIEW_CHANNEL: true})

            x.send(`✅ **»** ${membro}, envie o link da imagem de sua conta que você utiliza para fazer invasões!\nOBS: O canal será deletado em 2 minutos!`).then(msg2 => {
            let cp = x.createMessageCollector(x => x.author.id == membro.id, {max: 100})
           .on('collect', c => {
            const image = c.content
            if(!c.content.includes("https://")) {
              x.send(`:x: **»** ${membro}, sua imagem é invalida!\nOBS: Sua imagem deve ser enviada em formato de link!\nDICA: Caso não saiba pegar o link, basta enviar a imagem, clicar com o botão 'DIREITO' e clicar em 'COPIAR LINK' e logo após envia-la!`)
            } else {
            x.send(`✅ **»** ${membro}, a imagem de sua conta foi enviada para verificação!\n\`\`\`OBS: Se você for aceitou ou recusado, será enviada uma mensagem em seu pv & caso você seja recusado, podera fazer outra verificação em 1 hora!\`\`\``)
            x.send(`✅ **»** ${membro}, canal sendo deletado em 20 segundos!`)

            const embedverificação = new discord.MessageEmbed()
            .setDescription(`Imagem da conta de: ${membro}`)
            .setImage(image)
            .setFooter('Reaja com ✅ para aceitar, ou ❌ para recusar.')
            .setColor('RANDOM')

             x.updateOverwrite(membro, {SEND_MESSAGES: false})

            client.channels.cache.get('828365094458884108').send(embedverificação).then(msg => {
              msg.react('✅')
              msg.react('❌')

              /*const role = servidor.roles.cache.find(role => role.id == "828353159838695434")*/

              const SimFilter = (reaction, user, ) => reaction.emoji.name === '✅' && user.id == "680409371108311052" || user.id == "657941894311182337" || user.id == "827924467010895901" || user.id == "797924988752756766" || user.id == "776857593522946088" || user.id == "718544940140855306";

              const NaoFilter = (reaction, user, ) => reaction.emoji.name === '❌' && user.id == "680409371108311052" || user.id == "657941894311182337" || user.id == "827924467010895901" || user.id == "797924988752756766" || user.id == "776857593522946088" || user.id == "718544940140855306";

              const Sim = msg.createReactionCollector(SimFilter, {max: 1})
              const Nao = msg.createReactionCollector(NaoFilter, {max: 1})

              Sim.on('collect', r2 => {
                msg.delete()

                membro.send(`✅ **»** ${membro}, sua conta foi verificada com sucesso, e você ja tem acesso aos canais de invasão!`)

                const embedverificado = new discord.MessageEmbed()
                .setTitle(`A conta de ${membro}, foi verificada!`)
                .setImage(image)

                client.channels.cache.get('828410861739704372').send(membro, embedverificado)
              })

              Nao.on('collect', r2 => {

                db.set(`tempo_${membro}`, Date.now());

                msg.delete()

                membro.send(`✅ **»** ${membro}, sua conta foi recusada, você podera enviar outra solitação em 1 hora!`)
              })
            })
            setTimeout(() => {
              x.delete()
            }, 20000)
            }
              })
            })

            setTimeout(() => {
              try {
              x.delete()
              } catch (err) {
                console.log('a')
              }
            }, 120000)
            })
      }
    }
    }
  }
})

client.login(process.env.TOKEN);
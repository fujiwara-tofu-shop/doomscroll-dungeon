import './style.css'
import Phaser from 'phaser'

// Trend names sourced from current 2026 meme roundup/search signals.
const trends = [
  { name: 'Drake Hotline Bling', tag: 'classic format', emote: '🔥', color: 0x86d9ff, hp: 28, pattern: 'burst', taunt: 'nah / yeah energy', img: 'https://i.imgflip.com/30b1gx.jpg' },
  { name: 'Distracted Boyfriend', tag: 'trend temptation', emote: '👀', color: 0xff77cc, hp: 30, pattern: 'dash', taunt: 'locked in on the wrong target', img: 'https://i.imgflip.com/1ur9b0.jpg' },
  { name: 'Woman Yelling At Cat', tag: 'argument meta', emote: '🗯️', color: 0xb4ff5d, hp: 30, pattern: 'orbital', taunt: 'internet discourse boss', img: 'https://i.imgflip.com/345v97.jpg' },
  { name: 'This Is Fine', tag: 'doomscroll mood', emote: '🔥', color: 0xffc65f, hp: 32, pattern: 'dash', taunt: 'everything is absolutely not fine', img: 'https://i.imgflip.com/wxica.jpg' },
  { name: 'Surprised Pikachu', tag: 'reaction core', emote: '⚡', color: 0x8ec5ff, hp: 32, pattern: 'burst', taunt: 'no way that happened', img: 'https://i.imgflip.com/2kbn1e.jpg' },
  { name: 'Expanding Brain', tag: 'galaxy takes', emote: '🧠', color: 0xff9edb, hp: 34, pattern: 'orbital', taunt: 'ascending bad opinions', img: 'https://i.imgflip.com/1jwhww.jpg' },
  { name: 'Roll Safe', tag: 'big brain cope', emote: '👉', color: 0x9cff8f, hp: 34, pattern: 'dash', taunt: 'can’t lose if you redefine winning', img: 'https://i.imgflip.com/1h7in3.jpg' },
  { name: 'Change My Mind', tag: 'debate bait', emote: '🪑', color: 0xffd27d, hp: 36, pattern: 'burst', taunt: 'unmovable opinion detected', img: 'https://i.imgflip.com/24y43o.jpg' },
  { name: 'Is This A Pigeon', tag: 'mislabel simulator', emote: '🦋', color: 0x82e8ff, hp: 36, pattern: 'dash', taunt: 'is this... good game design?', img: 'https://i.imgflip.com/1o00in.jpg' },
  { name: 'Mocking SpongeBob', tag: 'reply guy arc', emote: '🧽', color: 0xff8fd5, hp: 38, pattern: 'orbital', taunt: 'mOcKiNg tOnE aCtIvAtEd', img: 'https://i.imgflip.com/1otk96.jpg' },
  { name: 'One Does Not Simply', tag: 'forbidden task', emote: '🧔', color: 0xa6ff78, hp: 38, pattern: 'burst', taunt: 'one does not simply clear room 11', img: 'https://i.imgflip.com/1bij.jpg' },
  { name: 'Left Exit 12 Off Ramp', tag: 'swerve meta', emote: '🚗', color: 0xffc160, hp: 40, pattern: 'dash', taunt: 'hard turn into bad decisions', img: 'https://i.imgflip.com/22bdq6.jpg' },
  { name: 'Running Away Balloon', tag: 'priority panic', emote: '🎈', color: 0x8bcfff, hp: 40, pattern: 'orbital', taunt: 'chasing the wrong objective', img: 'https://i.imgflip.com/261o3j.jpg' },
  { name: 'Batman Slapping Robin', tag: 'correction arc', emote: '🦇', color: 0xff79c7, hp: 42, pattern: 'burst', taunt: 'no bad takes in my lobby', img: 'https://i.imgflip.com/9ehk.jpg' },
  { name: 'Ancient Aliens', tag: 'wild theory mode', emote: '👽', color: 0xadff7c, hp: 42, pattern: 'dash', taunt: 'it was memes, obviously', img: 'https://i.imgflip.com/26am.jpg' },
  { name: 'X, X Everywhere', tag: 'overload screen', emote: '📌', color: 0xffc86a, hp: 44, pattern: 'orbital', taunt: 'too many options, zero wisdom', img: 'https://i.imgflip.com/1ihzfe.jpg' },
  { name: 'UNO Draw 25 Cards', tag: 'pain stack', emote: '🃏', color: 0x7fd3ff, hp: 44, pattern: 'burst', taunt: 'draw 25 bullets instead', img: 'https://i.imgflip.com/3lmzyx.jpg' },
  { name: 'Always Has Been', tag: 'astronaut reveal', emote: '🧑‍🚀', color: 0xff8ed0, hp: 46, pattern: 'dash', taunt: 'wait… it was boss rush all along?', img: 'https://i.imgflip.com/46e43q.png' },
  { name: 'Disaster Girl', tag: 'chaos smile', emote: '🔥', color: 0xb8ff70, hp: 46, pattern: 'orbital', taunt: 'she definitely set this room on fire', img: 'https://i.imgflip.com/23ls.jpg' },
  { name: 'Waiting Skeleton', tag: 'eternal queue', emote: '🦴', color: 0xffc55f, hp: 48, pattern: 'dash', taunt: 'still waiting for your iframe to end', img: 'https://i.imgflip.com/2fm6x.jpg' },
]

class DoomscrollScene extends Phaser.Scene {
  constructor() {
    super('doomscroll')
    this.room = 0
    this.bestRoom = Number(localStorage.getItem('doomscroll_best_room') || 0)
    this.hp = 100
    this.boss = null
    this.bossRadius = 42
    this.nextBossAt = 0
    this.iframesUntil = 0
  }

  preload() {
    trends.forEach((t, i) => {
      this.load.image(`boss_${i}`, t.img)
    })
  }

  create() {
    const { width, height } = this.scale
    this.cameras.main.setBackgroundColor('#0b1020')

    this.bg = this.add.rectangle(width / 2, height / 2, width, height, 0x0b1020)

    this.player = this.add.circle(width / 2, height - 90, 16, 0xffffff)
    this.physics.add.existing(this.player)
    this.player.body.setCircle(16)
    this.player.body.setCollideWorldBounds(true)

    this.cursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      dash: Phaser.Input.Keyboard.KeyCodes.SHIFT,
      restart: Phaser.Input.Keyboard.KeyCodes.R,
    })

    this.bullets = this.physics.add.group({ maxSize: 200 })
    this.enemyBullets = this.physics.add.group({ maxSize: 320 })

    this.input.on('pointerdown', (p) => this.fireAt(p.worldX, p.worldY))
    this.input.keyboard.on('keydown-SPACE', () => {
      const p = this.input.activePointer
      this.fireAt(p.worldX, p.worldY)
    })

    this.physics.add.overlap(this.player, this.enemyBullets, (_player, b) => {
      b.destroy()
      this.damagePlayer(10)
    })

    this.title = this.add.text(18, 12, 'DOOMSCROLL DUNGEON', { fontFamily: 'system-ui', fontSize: '24px', color: '#9fe3ff', fontStyle: '700' })
    this.roomText = this.add.text(18, 44, 'Room: 0', { fontSize: '18px', color: '#f2f6ff' })
    this.bestText = this.add.text(18, 68, `Best: ${this.bestRoom}`, { fontSize: '16px', color: '#87ffa7' })
    this.hpText = this.add.text(18, 90, 'HP: 100', { fontSize: '16px', color: '#ffd2d2' })
    this.bossText = this.add.text(width - 18, 18, '', { fontSize: '20px', color: '#fff', align: 'right', fontStyle: '700' }).setOrigin(1, 0)
    this.bossHpText = this.add.text(width - 18, 46, '', { fontSize: '16px', color: '#ffd8a8', align: 'right' }).setOrigin(1, 0)
    this.memeTicker = this.add.text(width / 2, height - 26, 'WASD move · click/space shoot · Shift dash · R restart', { fontSize: '14px', color: '#b6c7ec' }).setOrigin(0.5)

    this.banner = this.add.text(width / 2, height / 2, 'Tap or SPACE to enter the feed', {
      fontSize: '30px',
      color: '#ffffff',
      backgroundColor: '#15233d',
      padding: { x: 16, y: 10 },
      fontStyle: '700',
    }).setOrigin(0.5)

    this.started = false
    this.input.once('pointerdown', () => this.startRun())
    this.input.keyboard.once('keydown-SPACE', () => this.startRun())
  }

  startRun() {
    if (this.started) return
    this.started = true
    this.banner.destroy()
    this.nextRoom()
  }

  nextRoom() {
    this.room += 1
    this.roomText.setText(`Room: ${this.room}`)
    if (this.room > this.bestRoom) {
      this.bestRoom = this.room
      localStorage.setItem('doomscroll_best_room', String(this.bestRoom))
      this.bestText.setText(`Best: ${this.bestRoom}`)
    }

    const idx = (this.room - 1) % trends.length
    const trend = trends[idx]
    this.boss = {
      ...trend,
      hp: trend.hp + Math.floor(this.room * 0.9),
      t: 0,
      key: `boss_${idx}`,
    }

    const { width } = this.scale
    this.bossBody?.destroy()
    this.bossImage?.destroy()
    this.bossTag?.destroy()

    this.bg.setFillStyle(Phaser.Display.Color.IntegerToColor(trend.color).darken(65).color, 1)

    this.bossBody = this.add.circle(width / 2, 130, this.bossRadius + 8, trend.color, 0.28)
    this.physics.add.existing(this.bossBody)
    this.bossBody.body.setImmovable(true)

    this.bossImage = this.add.image(width / 2, 130, this.boss.key).setDisplaySize(88, 88)
    this.bossTag = this.add.text(width / 2, 186, `${trend.emote} ${trend.name} // ${trend.tag}`, {
      fontSize: '18px', color: '#ffffff', backgroundColor: '#00000066', padding: { x: 10, y: 4 }, fontStyle: '700'
    }).setOrigin(0.5)

    this.bossText.setText(`Trend Boss: ${this.boss.name}`)
    this.bossHpText.setText(`Boss HP: ${this.boss.hp}`)
    this.memeTicker.setText(`🔥 ${trend.taunt} · room ${this.room}`)

    this.popText(`ROOM ${this.room}: ${this.boss.name}`)
    this.nextBossAt = this.time.now + 500
  }

  clearRoom() {
    this.enemyBullets.clear(true, true)
    this.hp = Math.min(100, this.hp + 12)
    this.hpText.setText(`HP: ${this.hp}`)
    this.popText('ROOM CLEARED +12 HP')
    this.time.delayedCall(900, () => this.nextRoom())
  }

  damagePlayer(amount) {
    if (this.time.now < this.iframesUntil) return
    this.iframesUntil = this.time.now + 600
    this.hp = Math.max(0, this.hp - amount)
    this.hpText.setText(`HP: ${this.hp}`)
    this.cameras.main.shake(90, 0.0035)
    this.tweens.add({ targets: this.player, alpha: 0.2, yoyo: true, duration: 70, repeat: 4 })
    if (this.hp <= 0) this.gameOver()
  }

  gameOver() {
    this.started = false
    this.physics.pause()
    this.popText('YOU GOT DOOMSCROLLED')
    this.time.delayedCall(850, () => this.scene.restart())
  }

  popText(msg) {
    const { width, height } = this.scale
    const t = this.add.text(width / 2, height / 2 - 70, msg, {
      fontSize: '34px', color: '#fff7ad', fontStyle: '800', stroke: '#201a08', strokeThickness: 6,
    }).setOrigin(0.5)
    this.tweens.add({ targets: t, y: t.y - 40, alpha: 0, duration: 850, onComplete: () => t.destroy() })
  }

  fireAt(x, y) {
    if (!this.started) return
    const b = this.add.circle(this.player.x, this.player.y - 12, 5, 0x9fe3ff)
    this.physics.add.existing(b)
    this.bullets.add(b)
    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, x, y)
    const speed = 420
    b.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed)
    this.time.delayedCall(1400, () => b.destroy())
  }

  spawnEnemyBullet(x, y, vx, vy, r = 7, color = 0xff7c7c) {
    const b = this.add.circle(x, y, r, color)
    this.physics.add.existing(b)
    this.enemyBullets.add(b)
    b.body.setVelocity(vx, vy)
    this.time.delayedCall(3800, () => b.destroy())
  }

  handleBossHits() {
    if (!this.boss || !this.bossBody) return
    this.bullets.getChildren().forEach((b) => {
      if (!b.active) return
      const d = Phaser.Math.Distance.Between(b.x, b.y, this.bossBody.x, this.bossBody.y)
      if (d < this.bossRadius + 8) {
        b.destroy()
        this.boss.hp -= 1
        this.bossHpText.setText(`Boss HP: ${this.boss.hp}`)
        this.tweens.add({ targets: [this.bossBody, this.bossImage], scale: 1.1, yoyo: true, duration: 60 })
        if (this.boss.hp <= 0) this.clearRoom()
      }
    })
  }

  update(_t, dtMs) {
    if (!this.started) return
    const dt = dtMs / 1000

    const speed = this.cursors.dash.isDown ? 260 : 190
    let vx = 0, vy = 0
    if (this.cursors.left.isDown) vx -= speed
    if (this.cursors.right.isDown) vx += speed
    if (this.cursors.up.isDown) vy -= speed
    if (this.cursors.down.isDown) vy += speed
    this.player.body.setVelocity(vx, vy)

    if (this.boss && this.bossBody) {
      this.boss.t += dt
      const t = this.boss.t
      const { width } = this.scale
      this.bossBody.x = width / 2 + Math.sin(t * 1.35) * 170
      this.bossBody.y = 130 + Math.sin(t * 2.2) * 26
      if (this.bossImage) this.bossImage.setPosition(this.bossBody.x, this.bossBody.y)
      this.bossTag?.setPosition(this.bossBody.x, this.bossBody.y + 56)

      if (this.time.now > this.nextBossAt) {
        this.nextBossAt = this.time.now + Math.max(360, 980 - this.room * 12)
        if (this.boss.pattern === 'burst') {
          for (let i = 0; i < 10; i++) {
            const a = (Math.PI * 2 * i) / 10 + t
            this.spawnEnemyBullet(this.bossBody.x, this.bossBody.y, Math.cos(a) * 105, Math.sin(a) * 105, 6, 0xff9a7c)
          }
        } else if (this.boss.pattern === 'dash') {
          const a = Phaser.Math.Angle.Between(this.bossBody.x, this.bossBody.y, this.player.x, this.player.y)
          for (let i = -2; i <= 2; i++) {
            const aa = a + i * 0.08
            this.spawnEnemyBullet(this.bossBody.x, this.bossBody.y, Math.cos(aa) * 170, Math.sin(aa) * 170, 7, 0xff65c4)
          }
        } else {
          for (let i = 0; i < 6; i++) {
            const a = t * 2 + i * 1.04
            const sx = this.bossBody.x + Math.cos(a) * 40
            const sy = this.bossBody.y + Math.sin(a) * 40
            const toPlayer = Phaser.Math.Angle.Between(sx, sy, this.player.x, this.player.y)
            this.spawnEnemyBullet(sx, sy, Math.cos(toPlayer) * 130, Math.sin(toPlayer) * 130, 7, 0x9aff7f)
          }
        }
      }
    }

    this.handleBossHits()

    if (Phaser.Input.Keyboard.JustDown(this.cursors.restart)) this.scene.restart()
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: 960,
  height: 540,
  backgroundColor: '#0a0f1f',
  parent: 'app',
  physics: { default: 'arcade', arcade: { debug: false } },
  scene: [DoomscrollScene],
})

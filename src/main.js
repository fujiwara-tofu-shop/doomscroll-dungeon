import './style.css'
import Phaser from 'phaser'

const trends = [
  { name: 'Skibidi Surge', color: 0x6ef3ff, hp: 24, speed: 95, pattern: 'burst' },
  { name: 'Rizz Reaper', color: 0xff77cc, hp: 30, speed: 120, pattern: 'dash' },
  { name: 'Ohio Anomaly', color: 0xb4ff5d, hp: 36, speed: 90, pattern: 'orbital' },
  { name: 'Sigma Static', color: 0xffc65f, hp: 44, speed: 130, pattern: 'dash' },
]

class DoomscrollScene extends Phaser.Scene {
  constructor() {
    super('doomscroll')
    this.room = 0
    this.bestRoom = Number(localStorage.getItem('doomscroll_best_room') || 0)
    this.hp = 100
    this.boss = null
    this.nextBossAt = 0
  }

  create() {
    const { width, height } = this.scale
    this.cameras.main.setBackgroundColor('#0a0f1f')

    // Grid background
    const g = this.add.graphics()
    g.lineStyle(1, 0x1d2e4f, 0.35)
    for (let x = 0; x < width; x += 40) g.lineBetween(x, 0, x, height)
    for (let y = 0; y < height; y += 40) g.lineBetween(0, y, width, y)

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

    this.bullets = this.physics.add.group({ maxSize: 120 })
    this.enemyBullets = this.physics.add.group({ maxSize: 220 })

    this.input.on('pointerdown', (p) => this.fireAt(p.worldX, p.worldY))
    this.input.keyboard.on('keydown-SPACE', () => {
      const p = this.input.activePointer
      this.fireAt(p.worldX, p.worldY)
    })

    this.physics.add.overlap(this.bullets, () => this.bossSprite, (bullet) => {
      if (!this.bossSprite?.active) return
      bullet.destroy()
      this.boss.hp -= 1
      this.bossHpText.setText(`Boss HP: ${this.boss.hp}`)
      this.tweens.add({ targets: this.bossSprite, scale: 1.15, yoyo: true, duration: 70 })
      if (this.boss.hp <= 0) this.clearRoom()
    })

    this.physics.add.overlap(this.player, this.enemyBullets, (_player, b) => {
      b.destroy()
      this.damagePlayer(6)
    })

    this.title = this.add.text(18, 12, 'DOOMSCROLL DUNGEON', { fontFamily: 'system-ui', fontSize: '24px', color: '#9fe3ff', fontStyle: '700' })
    this.roomText = this.add.text(18, 44, 'Room: 0', { fontSize: '18px', color: '#f2f6ff' })
    this.bestText = this.add.text(18, 68, `Best: ${this.bestRoom}`, { fontSize: '16px', color: '#87ffa7' })
    this.hpText = this.add.text(18, 90, 'HP: 100', { fontSize: '16px', color: '#ffd2d2' })
    this.bossText = this.add.text(width - 18, 18, '', { fontSize: '18px', color: '#fff', align: 'right' }).setOrigin(1, 0)
    this.bossHpText = this.add.text(width - 18, 44, '', { fontSize: '16px', color: '#ffd8a8', align: 'right' }).setOrigin(1, 0)
    this.help = this.add.text(width / 2, height - 28, 'WASD move · click/space shoot · Shift dash · R restart', { fontSize: '14px', color: '#b6c7ec' }).setOrigin(0.5)

    this.banner = this.add.text(width / 2, height / 2, 'Press click or SPACE to begin', {
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

    const trend = trends[(this.room - 1) % trends.length]
    this.boss = {
      ...trend,
      hp: trend.hp + Math.floor(this.room * 1.4),
      phase: 0,
      t: 0,
    }

    const { width } = this.scale
    this.bossSprite?.destroy()
    this.bossSprite = this.add.circle(width / 2, 130, 32, this.boss.color)
    this.physics.add.existing(this.bossSprite)
    this.bossSprite.body.setImmovable(true)

    this.bossText.setText(`Trend Boss: ${this.boss.name}`)
    this.bossHpText.setText(`Boss HP: ${this.boss.hp}`)

    this.popText(`ROOM ${this.room}: ${this.boss.name}`)
    this.nextBossAt = this.time.now + 500
  }

  clearRoom() {
    this.enemyBullets.clear(true, true)
    this.popText('ROOM CLEARED')
    this.time.delayedCall(900, () => this.nextRoom())
  }

  damagePlayer(amount) {
    this.hp = Math.max(0, this.hp - amount)
    this.hpText.setText(`HP: ${this.hp}`)
    this.cameras.main.shake(90, 0.0035)
    this.tweens.add({ targets: this.player, alpha: 0.3, yoyo: true, duration: 70, repeat: 2 })
    if (this.hp <= 0) this.gameOver()
  }

  gameOver() {
    this.started = false
    this.physics.pause()
    this.popText('YOU GOT DOOMSCROLLED')
    this.time.delayedCall(800, () => {
      this.scene.restart()
    })
  }

  popText(msg) {
    const { width, height } = this.scale
    const t = this.add.text(width / 2, height / 2 - 70, msg, {
      fontSize: '34px',
      color: '#fff7ad',
      fontStyle: '800',
      stroke: '#201a08',
      strokeThickness: 6,
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

  update(_t, dtMs) {
    if (!this.started) return
    const dt = dtMs / 1000

    // Player movement
    const speed = this.cursors.dash.isDown ? 260 : 190
    let vx = 0
    let vy = 0
    if (this.cursors.left.isDown) vx -= speed
    if (this.cursors.right.isDown) vx += speed
    if (this.cursors.up.isDown) vy -= speed
    if (this.cursors.down.isDown) vy += speed
    this.player.body.setVelocity(vx, vy)

    // Boss behavior
    if (this.boss && this.bossSprite) {
      this.boss.t += dt
      const t = this.boss.t
      const { width } = this.scale
      this.bossSprite.x = width / 2 + Math.sin(t * 1.35) * 170
      this.bossSprite.y = 130 + Math.sin(t * 2.2) * 26

      if (this.time.now > this.nextBossAt) {
        this.nextBossAt = this.time.now + Math.max(220, 760 - this.room * 18)
        if (this.boss.pattern === 'burst') {
          for (let i = 0; i < 10; i++) {
            const a = (Math.PI * 2 * i) / 10 + t
            this.spawnEnemyBullet(this.bossSprite.x, this.bossSprite.y, Math.cos(a) * 140, Math.sin(a) * 140, 6, 0xff9a7c)
          }
        } else if (this.boss.pattern === 'dash') {
          const a = Phaser.Math.Angle.Between(this.bossSprite.x, this.bossSprite.y, this.player.x, this.player.y)
          for (let i = -2; i <= 2; i++) {
            const aa = a + i * 0.08
            this.spawnEnemyBullet(this.bossSprite.x, this.bossSprite.y, Math.cos(aa) * 250, Math.sin(aa) * 250, 7, 0xff65c4)
          }
        } else {
          for (let i = 0; i < 6; i++) {
            const a = t * 2 + i * 1.04
            const sx = this.bossSprite.x + Math.cos(a) * 40
            const sy = this.bossSprite.y + Math.sin(a) * 40
            const toPlayer = Phaser.Math.Angle.Between(sx, sy, this.player.x, this.player.y)
            this.spawnEnemyBullet(sx, sy, Math.cos(toPlayer) * 180, Math.sin(toPlayer) * 180, 7, 0x9aff7f)
          }
        }
      }
    }

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

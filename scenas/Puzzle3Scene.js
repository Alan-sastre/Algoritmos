export default class Puzzle3Scene extends Phaser.Scene {
  constructor() {
    super("Puzzle3Scene");
    this.currentLevel = 1;
    this.sequences = [
      [0, 1],
      [0, 2, 1],
      [3, 0, 2, 1],
      [1, 3, 0, 2, 1],
      [2, 0, 3, 1, 2, 0],
    ];
    this.padColors = [0xff6b6b, 0x4ecdc4, 0xffd166, 0x6c5ce7];
    this.isCelebrating = false;
  }

  preload() {
    this.createTextures();
  }

  createTextures() {
    const graphics = this.make.graphics({ add: false });

    graphics.fillStyle(0x4caf50);
    graphics.fillCircle(34, 34, 32);
    graphics.fillStyle(0xffffff);
    graphics.beginPath();
    graphics.moveTo(25, 18);
    graphics.lineTo(25, 50);
    graphics.lineTo(49, 34);
    graphics.closePath();
    graphics.fillPath();
    graphics.generateTexture("sort_play", 68, 68);
    graphics.clear();

    graphics.fillStyle(0xef5350);
    graphics.fillCircle(34, 34, 32);
    graphics.lineStyle(8, 0xffffff);
    graphics.beginPath();
    graphics.moveTo(22, 22);
    graphics.lineTo(46, 46);
    graphics.moveTo(46, 22);
    graphics.lineTo(22, 46);
    graphics.strokePath();
    graphics.generateTexture("sort_reset", 68, 68);
    graphics.clear();

    graphics.fillStyle(0xffffff, 0.96);
    graphics.fillCircle(60, 60, 58);
    graphics.fillStyle(0xffffff, 0.35);
    graphics.fillCircle(45, 42, 32);
    graphics.lineStyle(10, 0xffffff, 0.9);
    graphics.strokeCircle(60, 60, 50);
    graphics.lineStyle(4, 0xffffff, 0.45);
    graphics.strokeCircle(60, 60, 36);
    graphics.generateTexture("seq_pad", 120, 120);
    graphics.clear();

    graphics.fillStyle(0xffffff, 0.45);
    graphics.fillRoundedRect(2, 2, 596, 106, 24);
    graphics.lineStyle(4, 0xffffff, 0.7);
    graphics.strokeRoundedRect(2, 2, 596, 106, 24);
    graphics.generateTexture("seq_strip", 600, 110);
    graphics.clear();

    graphics.fillStyle(0xffffff, 0.8);
    graphics.fillCircle(20, 20, 18);
    graphics.lineStyle(5, 0x1e88e5);
    graphics.beginPath();
    graphics.moveTo(15, 10);
    graphics.lineTo(27, 20);
    graphics.lineTo(15, 30);
    graphics.strokePath();
    graphics.generateTexture("sort_scan", 40, 40);
    graphics.clear();

    graphics.fillStyle(0xffd54f, 1);
    graphics.beginPath();
    graphics.moveTo(40, 5);
    graphics.lineTo(49, 28);
    graphics.lineTo(73, 30);
    graphics.lineTo(55, 45);
    graphics.lineTo(61, 69);
    graphics.lineTo(40, 56);
    graphics.lineTo(19, 69);
    graphics.lineTo(25, 45);
    graphics.lineTo(7, 30);
    graphics.lineTo(31, 28);
    graphics.closePath();
    graphics.fillPath();
    graphics.generateTexture("seq_star", 80, 80);
    graphics.clear();

    graphics.fillStyle(0xffffff, 0.95);
    graphics.fillRoundedRect(2, 2, 356, 96, 26);
    graphics.lineStyle(5, 0xff8a65, 1);
    graphics.strokeRoundedRect(2, 2, 356, 96, 26);
    graphics.generateTexture("seq_replay_btn", 360, 100);
    graphics.clear();

    graphics.destroy();
  }

  create() {
    this.add.rectangle(500, 250, 1000, 500, 0xd6f5ff);
    this.add.rectangle(500, 70, 1000, 120, 0xbde8ff);
    this.add.rectangle(500, 465, 1000, 90, 0xbde8ff);
    this.add.image(500, 68, "seq_strip").setAlpha(0.6);
    this.createBackgroundBubbles();
    this.mainLayer = this.add.container(0, 0);
    this.uiLayer = this.add.container(0, 0);
    this.startLevel();
  }

  startLevel() {
    this.isCelebrating = false;
    this.isBusy = false;
    this.isShowing = true;
    this.playerSequence = [];
    this.mainLayer.setVisible(true);
    this.uiLayer.setVisible(true);
    this.mainLayer.removeAll(true);
    this.uiLayer.removeAll(true);
    this.levelSequence =
      this.sequences[
        Phaser.Math.Clamp(this.currentLevel - 1, 0, this.sequences.length - 1)
      ];
    if (this.overlay) {
      this.overlay.destroy();
      this.overlay = null;
    }
    this.createPads();
    this.createAlgoStrip();
    this.createButtons();
    this.createLevelDots();
    this.startGuide();
    this.time.delayedCall(500, () => this.showSequence());
  }

  createLevelDots() {
    const dots = this.add.container(90, 28);
    for (let i = 0; i < this.sequences.length; i++) {
      const dot = this.add.circle(
        i * 24,
        0,
        9,
        i < this.currentLevel ? 0x29b6f6 : 0xb0bec5,
      );
      dots.add(dot);
    }
    this.uiLayer.add(dots);
  }

  createPads() {
    const positions = [
      { x: 340, y: 210 },
      { x: 660, y: 210 },
      { x: 340, y: 360 },
      { x: 660, y: 360 },
    ];
    this.pads = [];
    positions.forEach((pos, index) => {
      const pad = this.add
        .image(pos.x, pos.y, "seq_pad")
        .setTint(this.padColors[index])
        .setInteractive();
      pad.index = index;
      pad.on("pointerdown", () => this.onPadPressed(index));
      this.mainLayer.add(pad);
      this.pads.push(pad);
      this.tweens.add({
        targets: pad,
        scaleX: 1.04,
        scaleY: 1.04,
        duration: 900 + index * 90,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    });
  }

  createAlgoStrip() {
    this.tokens = [];
    const gap = 88;
    const startX = 500 - ((this.levelSequence.length - 1) * gap) / 2;
    this.levelSequence.forEach((step, index) => {
      const token = this.add.circle(startX + index * gap, 70, 20, this.padColors[step], 1);
      token.setStrokeStyle(4, 0xffffff, 0.9);
      this.uiLayer.add(token);
      this.tokens.push(token);
      this.tweens.add({
        targets: token,
        alpha: 0.75,
        duration: 700,
        yoyo: true,
        repeat: -1,
        delay: index * 80,
      });
      if (index < this.levelSequence.length - 1) {
        const arrow = this.add.text(startX + index * gap + gap / 2, 70, "➡️", {
          fontSize: "28px",
        }).setOrigin(0.5);
        this.uiLayer.add(arrow);
      }
    });
  }

  createButtons() {
    this.playButton = this.add.image(900, 230, "sort_play").setInteractive();
    this.resetButton = this.add.image(900, 330, "sort_reset").setInteractive();
    this.playButton.on("pointerdown", () => {
      if (this.isBusy) return;
      this.playerSequence = [];
      this.updateAlgoProgress();
      this.showSequence();
    });
    this.resetButton.on("pointerdown", () => {
      if (this.isBusy) return;
      this.startLevel();
    });
    this.uiLayer.add(this.playButton);
    this.uiLayer.add(this.resetButton);

    const replayHint = this.add.text(900, 172, "🔁", { fontSize: "34px" }).setOrigin(0.5);
    this.uiLayer.add(replayHint);
  }

  showSequence() {
    if (this.isBusy || this.isCelebrating) return;
    this.stopGuide();
    this.isShowing = true;
    this.isBusy = true;
    this.playerSequence = [];
    this.updateAlgoProgress();
    let index = 0;
    const playStep = () => {
      if (index >= this.levelSequence.length) {
        this.isShowing = false;
        this.isBusy = false;
        this.startGuide();
        return;
      }
      const padIndex = this.levelSequence[index];
      this.flashPad(padIndex, () => {
        index++;
        this.time.delayedCall(140, playStep);
      });
    };
    playStep();
  }

  onPadPressed(index) {
    if (this.isBusy || this.isShowing || this.isCelebrating) return;
    this.stopGuide();
    this.playerSequence.push(index);
    this.flashPad(index);
    this.updateAlgoProgress();
    const currentStep = this.playerSequence.length - 1;
    if (this.playerSequence[currentStep] !== this.levelSequence[currentStep]) {
      this.cameras.main.shake(220, 0.01);
      this.time.delayedCall(300, () => this.showSequence());
      return;
    }

    if (this.playerSequence.length === this.levelSequence.length) {
      this.winLevel();
      return;
    }
    this.startGuide();
  }

  flashPad(index, onComplete) {
    const pad = this.pads[index];
    this.emitSparkles(pad.x, pad.y, this.padColors[index]);
    this.tweens.add({
      targets: pad,
      scaleX: 1.17,
      scaleY: 1.17,
      alpha: 1,
      duration: 150,
      yoyo: true,
      ease: "Sine.easeInOut",
      onStart: () => {
        pad.setAlpha(0.8);
      },
      onComplete: () => {
        pad.setAlpha(1);
        if (onComplete) onComplete();
      },
    });
  }

  updateAlgoProgress() {
    this.tokens.forEach((token, index) => {
      if (index < this.playerSequence.length) {
        const ok = this.playerSequence[index] === this.levelSequence[index];
        token.setStrokeStyle(6, ok ? 0x66bb6a : 0xef5350, 1);
      } else if (index === this.playerSequence.length && !this.isShowing) {
        token.setStrokeStyle(6, 0x29b6f6, 1);
      } else {
        token.setStrokeStyle(4, 0xffffff, 0.9);
      }
    });
  }

  winLevel() {
    this.isBusy = true;
    this.stopGuide();
    const star = this.add.image(500, 260, "seq_star").setScale(0.5).setDepth(20);
    this.uiLayer.add(star);
    this.tweens.add({
      targets: star,
      scaleX: 1.8,
      scaleY: 1.8,
      angle: 25,
      duration: 350,
      yoyo: true,
      ease: "Back.easeOut",
    });
    this.time.delayedCall(700, () => {
      this.currentLevel++;
      if (this.currentLevel > this.sequences.length) {
        this.showFinalCelebration();
        return;
      }
      this.startLevel();
    });
  }

  showFinalCelebration() {
    this.isCelebrating = true;
    this.isBusy = true;
    this.mainLayer.setVisible(false);
    this.uiLayer.setVisible(false);
    this.overlay = this.add.container(0, 0);
    const bg = this.add.rectangle(500, 250, 1000, 500, 0x0b3b5a, 0.82);
    const glow = this.add.circle(500, 210, 170, 0xfff59d, 0.35);
    const bigStar = this.add.image(500, 210, "seq_star").setScale(1.2);
    const title = this.add.text(500, 120, "🎉 ¡FELICITACIONES! 🎉", {
      fontSize: "58px",
      color: "#ffffff",
      fontStyle: "bold",
    }).setOrigin(0.5);
    const replayShadow = this.add.ellipse(500, 372, 390, 120, 0x000000, 0.2);
    this.overlay.add([bg, glow, bigStar, title, replayShadow]);
    this.emitConfettiRain();
    const replayBg = this.add.image(500, 360, "seq_replay_btn").setInteractive();
    const replayText = this.add.text(500, 360, "¿QUIERES VOLVER A JUGAR?", {
      fontSize: "28px",
      color: "#bf360c",
      fontStyle: "bold",
    }).setOrigin(0.5);
    replayBg.on("pointerdown", () => {
      this.currentLevel = 1;
      this.startLevel();
    });
    this.overlay.add([replayBg, replayText]);
    this.overlay.bringToTop(replayBg);
    this.overlay.bringToTop(replayText);
    this.tweens.add({
      targets: [bigStar, glow],
      scaleX: 1.35,
      scaleY: 1.35,
      alpha: 0.8,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    this.tweens.add({
      targets: replayBg,
      scaleX: 1.04,
      scaleY: 1.04,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  createBackgroundBubbles() {
    this.bgLayer = this.add.container(0, 0);
    for (let i = 0; i < 12; i++) {
      const bubble = this.add.circle(
        Phaser.Math.Between(40, 960),
        Phaser.Math.Between(60, 470),
        Phaser.Math.Between(10, 24),
        0xffffff,
        Phaser.Math.FloatBetween(0.12, 0.28),
      );
      this.bgLayer.add(bubble);
      this.tweens.add({
        targets: bubble,
        y: bubble.y - Phaser.Math.Between(40, 90),
        x: bubble.x + Phaser.Math.Between(-20, 20),
        duration: Phaser.Math.Between(1900, 3400),
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
        delay: i * 120,
      });
    }
  }

  emitSparkles(x, y, color) {
    for (let i = 0; i < 6; i++) {
      const p = this.add.circle(x, y, Phaser.Math.Between(3, 6), color, 0.9);
      this.uiLayer.add(p);
      this.tweens.add({
        targets: p,
        x: x + Phaser.Math.Between(-45, 45),
        y: y + Phaser.Math.Between(-45, 45),
        alpha: 0,
        duration: 380,
        ease: "Cubic.easeOut",
        onComplete: () => p.destroy(),
      });
    }
  }

  emitConfettiRain() {
    for (let i = 0; i < 120; i++) {
      const color = Phaser.Utils.Array.GetRandom(this.padColors);
      const conf = this.add.rectangle(
        Phaser.Math.Between(20, 980),
        Phaser.Math.Between(-380, -20),
        Phaser.Math.Between(6, 12),
        Phaser.Math.Between(10, 18),
        color,
      );
      this.overlay.add(conf);
      this.tweens.add({
        targets: conf,
        y: Phaser.Math.Between(520, 650),
        x: conf.x + Phaser.Math.Between(-120, 120),
        angle: Phaser.Math.Between(180, 540),
        duration: Phaser.Math.Between(1900, 3600),
        delay: Phaser.Math.Between(0, 1100),
        ease: "Quad.easeIn",
        onComplete: () => conf.destroy(),
      });
    }
  }

  startGuide() {
    if (this.isShowing || this.isBusy) return;
    this.stopGuide();
    const step = this.levelSequence[this.playerSequence.length];
    const targetPad = this.pads[step];
    if (!targetPad) return;
    this.guideHand = this.add
      .text(targetPad.x, targetPad.y + 76, "👆🏻", {
        fontSize: "68px",
      })
      .setOrigin(0.5)
      .setDepth(40);
    this.uiLayer.add(this.guideHand);
    this.guideTween = this.tweens.add({
      targets: this.guideHand,
      y: targetPad.y + 58,
      duration: 320,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  stopGuide() {
    if (this.guideTween) {
      this.guideTween.stop();
      this.guideTween = null;
    }
    if (this.guideHand) {
      this.guideHand.destroy();
      this.guideHand = null;
    }
  }
}

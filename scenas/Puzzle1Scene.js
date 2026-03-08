export default class Puzzle1Scene extends Phaser.Scene {
  constructor() {
    super("Puzzle1Scene");
  }

  preload() {
    this.createTextures();
  }

  createTextures() {
    let graphics = this.make.graphics({ x: 0, y: 0, add: false });

    // 1. Robot Realista Mejorado
    // Cuerpo principal con sombreado simulado
    graphics.fillStyle(0x546e7a, 1); // Base oscura
    graphics.fillRoundedRect(5, 15, 54, 40, 8);
    graphics.fillStyle(0x78909c, 1); // Capa media
    graphics.fillRoundedRect(5, 15, 54, 30, 8);
    graphics.fillStyle(0xb0bec5, 1); // Capa superior clara
    graphics.fillRoundedRect(5, 15, 54, 20, 8);

    // Detalles del cuerpo
    graphics.fillStyle(0xeceff1, 0.7); // Reflejo superior
    graphics.fillRoundedRect(7, 17, 50, 5, 3);
    graphics.fillStyle(0x455a64, 1); // Borde inferior
    graphics.fillRoundedRect(5, 48, 54, 7, 8);

    // Cabeza
    graphics.fillStyle(0x455a64, 1);
    graphics.fillRoundedRect(15, 0, 34, 20, 5);
    graphics.fillStyle(0x263238, 1); // Visor oscuro
    graphics.fillRect(20, 5, 24, 8);
    graphics.fillStyle(0x80deea, 0.8); // Brillo del visor
    graphics.fillEllipse(32, 9, 20, 4);

    // Ruedas
    graphics.fillStyle(0x546e7a, 1);
    graphics.fillCircle(15, 55, 10);
    graphics.fillCircle(49, 55, 10);
    graphics.fillStyle(0x37474f, 1); // Detalle ruedas
    graphics.fillCircle(15, 55, 6);
    graphics.fillCircle(49, 55, 6);
    graphics.fillStyle(0x90a4ae, 0.5); // Reflejo en ruedas
    graphics.fillCircle(13, 53, 3);
    graphics.fillCircle(47, 53, 3);

    graphics.generateTexture("robot_tex", 64, 75);
    graphics.clear();

    // 2. Batería Realista Mejorada
    // Cuerpo principal con sombreado simulado
    graphics.fillStyle(0x33691e, 1); // Base oscura
    graphics.fillRoundedRect(5, 10, 50, 45, 6);
    graphics.fillStyle(0x558b2f, 1); // Capa media
    graphics.fillRoundedRect(5, 10, 50, 35, 6);
    graphics.fillStyle(0x7cb342, 1); // Capa superior clara
    graphics.fillRoundedRect(5, 10, 50, 25, 6);
    graphics.lineStyle(2, 0x455a64, 1); // Borde más sutil
    graphics.strokeRoundedRect(5, 10, 50, 45, 6);

    // Polo positivo
    graphics.fillStyle(0x455a64, 1);
    graphics.fillRoundedRect(55, 20, 8, 25, 3);
    graphics.fillStyle(0x90a4ae, 0.8); // Reflejo en polo
    graphics.fillRect(56, 22, 6, 3);

    // Celdas internas con sombreado
    for (let i = 0; i < 3; i++) {
      graphics.fillStyle(0x33691e, 1); // Verde oscuro
      graphics.fillRoundedRect(12 + i * 13, 18, 10, 30, 3);
      graphics.fillStyle(0x558b2f, 0.7); // Reflejo en celdas
      graphics.fillRoundedRect(13 + i * 13, 19, 8, 5, 2);
    }
    graphics.generateTexture("battery_tex", 65, 65);
    graphics.clear();

    // 3. Flecha 3D Mejorada
    // Base de la flecha (sombra)
    graphics.fillStyle(0x01579b, 1); // Azul muy oscuro
    graphics.beginPath();
    graphics.moveTo(5, 20);
    graphics.lineTo(35, 20);
    graphics.lineTo(35, 10);
    graphics.lineTo(60, 32);
    graphics.lineTo(35, 54);
    graphics.lineTo(35, 44);
    graphics.lineTo(5, 44);
    graphics.closePath();
    graphics.fillPath();

    // Parte superior de la flecha (color principal)
    graphics.fillStyle(0x0288d1, 1); // Azul oscuro
    graphics.beginPath();
    graphics.moveTo(7, 21);
    graphics.lineTo(36, 21);
    graphics.lineTo(36, 12);
    graphics.lineTo(58, 32);
    graphics.lineTo(36, 52);
    graphics.lineTo(36, 43);
    graphics.lineTo(7, 43);
    graphics.closePath();
    graphics.fillPath();

    // Reflejo/Brillo
    graphics.fillStyle(0x81d4fa, 0.7); // Azul muy claro
    graphics.beginPath();
    graphics.moveTo(7, 21);
    graphics.lineTo(36, 21);
    graphics.lineTo(36, 12);
    graphics.lineTo(58, 32);
    graphics.lineTo(55, 32);
    graphics.lineTo(34, 15);
    graphics.closePath();
    graphics.fillPath();

    graphics.generateTexture("arrow_tex", 64, 64);
    graphics.clear();
  }

  create() {
    this.add.rectangle(500, 250, 1000, 500, 0xddeeff);
    this.add.grid(500, 250, 1000, 500, 50, 50, 0x000000, 0.03);
    this.add.rectangle(500, 450, 1000, 100, 0xcccccc);

    this.goal = this.add.image(850, 250, "battery_tex").setScale(1.5);
    this.robot = this.add.image(150, 250, "robot_tex").setScale(1.2);

    this.tweens.add({
      targets: [this.robot, this.goal],
      y: "+=8",
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this.slots = [];
    this.commands = [null, null, null];
    for (let i = 0; i < 3; i++) {
      let slot = this.add
        .rectangle(400 + i * 130, 430, 110, 90, 0xbbbbbb, 1)
        .setStrokeStyle(4, 0x666666, 0.5);
      this.slots.push(slot);
      this.add
        .text(slot.x, slot.y - 65, (i + 1).toString(), {
          color: "#333",
          fontSize: "26px",
          fontStyle: "bold",
        })
        .setOrigin(0.5);
    }

    this.arrows = [];
    for (let i = 0; i < 3; i++) {
      let arrow = this.add
        .image(150 + i * 110, 100, "arrow_tex")
        .setInteractive({ draggable: true })
        .setData("origX", 150 + i * 110)
        .setData("origY", 100)
        .setData("slotIndex", -1);

      this.arrows.push(arrow);

      // Animación de pulso para las flechas
      this.tweens.add({
        targets: arrow,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 700,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      arrow.on("dragstart", () => {
        let nextSlotIndex = this.commands.findIndex((c) => !c);
        if (nextSlotIndex !== -1) {
          let targetSlot = this.slots[nextSlotIndex];
          this.moveHandTo(targetSlot.x, targetSlot.y);
          this.hand.setAlpha(1);
        } else {
          this.hand.setAlpha(0);
        }
      });

      arrow.on("drag", (pointer, dragX, dragY) => {
        arrow.x = dragX;
        arrow.y = dragY;
        arrow.setScale(1.3);
        arrow.setDepth(100);
      });

      arrow.on("dragend", () => {
        arrow.setScale(1);
        arrow.setDepth(1);
        let dropped = false;

        for (let j = 0; j < this.slots.length; j++) {
          let s = this.slots[j];
          if (
            Phaser.Geom.Intersects.RectangleToRectangle(
              arrow.getBounds(),
              s.getBounds(),
            )
          ) {
            if (!this.commands[j] || arrow.getData("slotIndex") === j) {
              let oldIdx = arrow.getData("slotIndex");
              if (oldIdx !== -1) this.commands[oldIdx] = null;

              arrow.x = s.x;
              arrow.y = s.y;
              arrow.setData("slotIndex", j);
              this.commands[j] = "right";
              dropped = true;
              s.setStrokeStyle(6, 0x33ff33, 1);
              this.sound_pop();
              break;
            }
          }
        }

        if (!dropped) {
          let oldIdx = arrow.getData("slotIndex");
          if (oldIdx !== -1) {
            this.commands[oldIdx] = null;
            this.slots[oldIdx].setStrokeStyle(4, 0x666666, 0.5);
          }
          arrow.x = arrow.getData("origX");
          arrow.y = arrow.getData("origY");
          arrow.setData("slotIndex", -1);
        }
        this.updateHandPosition();
      });
    }

    this.playBtn = this.add.container(920, 430);
    let btnCircle = this.add
      .circle(0, 0, 45, 0x2ecc71)
      .setInteractive()
      .setStrokeStyle(4, 0xffffff);
    let btnIcon = this.add
      .text(0, 0, "▶", { fontSize: "45px", color: "#fff" })
      .setOrigin(0.5);
    this.playBtn.add([btnCircle, btnIcon]);
    btnCircle.on("pointerdown", () => this.runAlgorithm());

    // Ajuste CRÍTICO: El origen (0.2, 0) significa que el punto (x,y) estará en la punta del dedo índice
    // El padding evita el recorte.
    this.hand = this.add
      .text(0, 0, "👆🏻", {
        fontSize: "75px",
        padding: { x: 30, y: 30 },
      })
      .setOrigin(0.25, 0)
      .setDepth(200);

    this.updateHandPosition();
  }

  sound_pop() {
    this.cameras.main.shake(100, 0.005);
  }

  updateHandPosition() {
    this.hand.setAlpha(1);
    let nextSlotIndex = this.commands.findIndex((c) => !c);

    // Si hay un hueco vacío, señalamos la flecha
    if (nextSlotIndex !== -1) {
      let freeArrow = this.arrows.find((a) => a.getData("slotIndex") === -1);
      if (freeArrow) {
        // Apuntar directamente DEBAJO de la flecha, para que el dedo toque la flecha
        this.moveHandTo(freeArrow.x, freeArrow.y);
      } else {
        // Si no hay flechas libres pero faltan slots (caso raro), apuntamos a la primera flecha
        this.moveHandTo(this.arrows[0].x, this.arrows[0].y);
      }
    } else {
      // Si todos los slots están llenos, apuntamos al botón Play
      this.moveHandTo(this.playBtn.x, this.playBtn.y);
    }
  }

  moveHandTo(x, y) {
    if (this.handTween) this.handTween.stop();

    // Lógica de orientación inteligente
    let offsetY = 50;
    let targetY = y;

    if (y > 300) {
      // Objeto en la parte inferior -> Mano ARRIBA apuntando ABAJO
      this.hand.setText("👇🏻");
      this.hand.setOrigin(0.2, 1); // Punta del dedo abajo
      targetY = y - offsetY;
    } else {
      // Objeto en la parte superior -> Mano ABAJO apuntando ARRIBA
      this.hand.setText("👆🏻");
      this.hand.setOrigin(0.2, 0); // Punta del dedo arriba
      targetY = y + offsetY;
    }

    this.handTween = this.tweens.add({
      targets: this.hand,
      x: x,
      y: targetY,
      duration: 500,
      ease: "Cubic.easeOut",
    });
  }

  runAlgorithm() {
    if (this.commands.filter((c) => c).length < 3) {
      this.cameras.main.shake(250, 0.015);
      return;
    }

    this.playBtn.setAlpha(0.5).disableInteractive();
    this.hand.setAlpha(0);
    this.arrows.forEach((a) => a.disableInteractive());

    this.executeStep(0, Array.from(this.commands));
  }

  executeStep(index, sequence) {
    if (index >= sequence.length) {
      this.checkWin();
      return;
    }

    this.tweens.add({
      targets: this.robot,
      x: this.robot.x + 230,
      duration: 900,
      ease: "Back.easeOut",
      onStart: () => {
        this.tweens.add({
          targets: this.robot,
          scaleY: 0.9,
          scaleX: 1.3,
          duration: 150,
          yoyo: true,
        });
      },
      onComplete: () => {
        this.executeStep(index + 1, sequence);
      },
    });
  }

  checkWin() {
    if (this.robot.x >= 750) {
      this.emitConfetti(60);
      this.tweens.add({
        targets: this.robot,
        y: this.robot.y - 35,
        angle: 10,
        duration: 280,
        yoyo: true,
        repeat: 1,
        ease: "Back.easeOut",
      });
      this.tweens.add({
        targets: this.robot,
        x: this.goal.x - 90,
        duration: 650,
        ease: "Cubic.easeOut",
        onComplete: () => {
          this.tweens.add({
            targets: [this.robot, this.goal],
            scaleX: 1.18,
            scaleY: 1.18,
            duration: 180,
            yoyo: true,
            repeat: 2,
            ease: "Sine.easeInOut",
          });
          this.goal.setTint(0x7cfc00);
          this.add.text(500, 190, "🎉", { fontSize: "140px" }).setOrigin(0.5);
          this.time.delayedCall(1700, () => this.scene.start("Puzzle2Scene"));
        },
      });
    } else {
      this.cameras.main.shake(600, 0.02);
      this.time.delayedCall(1000, () => this.scene.restart());
    }
  }

  emitConfetti(amount) {
    const colors = [0xff6b6b, 0x4ecdc4, 0xffd166, 0x6c5ce7, 0x2ecc71];
    for (let i = 0; i < amount; i++) {
      const conf = this.add.rectangle(
        Phaser.Math.Between(30, 970),
        Phaser.Math.Between(-200, -20),
        Phaser.Math.Between(6, 12),
        Phaser.Math.Between(10, 18),
        Phaser.Utils.Array.GetRandom(colors),
      );
      this.tweens.add({
        targets: conf,
        y: Phaser.Math.Between(530, 650),
        x: conf.x + Phaser.Math.Between(-110, 110),
        angle: Phaser.Math.Between(180, 540),
        duration: Phaser.Math.Between(1300, 2600),
        delay: Phaser.Math.Between(0, 600),
        ease: "Quad.easeIn",
        onComplete: () => conf.destroy(),
      });
    }
  }
}

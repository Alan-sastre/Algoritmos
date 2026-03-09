/**
 * @file Puzzle2Scene.js
 * @description Puzzle de construcción de patrones visuales para niños.
 *
 * --- DOCUMENTACIÓN DE DISEÑO ---
 * Concepto: "Constructor de Patrones".
 * Objetivo: Enseñar reconocimiento y replicación de secuencias lógicas (patrones).
 * Mecánica: Arrastrar y soltar formas geométricas de colores para copiar un patrón modelo.
 * Interfaz: Puramente visual, sin texto. Jerarquía clara:
 *   1. Área de "Patrón a Seguir" (arriba, no interactivo).
 *   2. Área de "Construcción" (centro, interactivo).
 *   3. "Paleta de Formas" (abajo, de donde se arrastran las piezas).
 * Ayuda Interactiva: La "mano guía" señalará la siguiente forma correcta en la paleta y luego el slot vacío correspondiente en el área de construcción.
 * Feedback:
 *   - Correcto: La pieza encaja con una animación suave y un sonido positivo.
 *   - Incorrecto: La pieza tiembla, se colorea de rojo y vuelve a su origen.
 * Progresión: 5 niveles que aumentan la longitud y complejidad del patrón.
 */

export default class Puzzle2Scene extends Phaser.Scene {
  constructor() {
    super("Puzzle2Scene");
    this.currentLevel = 1;
    this.maxLevels = 5;
    this.pattern = []; // El patrón a resolver en el nivel actual
    this.playerPattern = []; // El patrón que el jugador está construyendo
    this.slots = []; // Los espacios para colocar las formas
    this.paletteShapes = []; // Las formas en la paleta para arrastrar
    this.hand = null; // La mano guía
    this.itemSpacing = 90;
    this.itemScale = 1;
  }

  preload() {
    this.createShapeTextures();
  }

  createShapeTextures() {
    const graphics = this.make.graphics({ add: false });
    const size = 80;

    // --- Formas Geométricas con Colores ---
    const shapes = {
      square_red: { type: "rect", color: 0xff4136 },
      circle_blue: { type: "circle", color: 0x0074d9 },
      triangle_yellow: { type: "triangle", color: 0xffdc00 },
    };

    for (const [key, config] of Object.entries(shapes)) {
      graphics.fillStyle(0xffffff, 0.95);
      graphics.fillRoundedRect(2, 2, size - 4, size - 4, 14);
      graphics.lineStyle(3, 0x000000, 0.12);
      graphics.strokeRoundedRect(2, 2, size - 4, size - 4, 14);

      graphics.fillStyle(config.color, 0.2);
      graphics.fillRoundedRect(8, 8, size - 16, size - 16, 12);

      graphics.fillStyle(config.color, 1);
      graphics.lineStyle(4, 0x1a1a1a, 0.45);

      const shapeSize = size * 0.66;
      const offset = (size - shapeSize) / 2;

      if (config.type === "rect") {
        graphics.fillRoundedRect(offset, offset, shapeSize, shapeSize, 8);
        graphics.strokeRoundedRect(offset, offset, shapeSize, shapeSize, 8);
        graphics.fillStyle(0xffffff, 0.24);
        graphics.fillRoundedRect(
          offset + 6,
          offset + 6,
          shapeSize - 12,
          shapeSize * 0.28,
          6,
        );
      } else if (config.type === "circle") {
        graphics.fillCircle(size / 2, size / 2, shapeSize / 2);
        graphics.strokeCircle(size / 2, size / 2, shapeSize / 2);
        graphics.fillStyle(0xffffff, 0.22);
        graphics.fillEllipse(
          size / 2 - 8,
          size / 2 - 10,
          shapeSize * 0.52,
          shapeSize * 0.26,
        );
      } else if (config.type === "triangle") {
        const topX = size / 2;
        const topY = offset + 2;
        const leftX = offset + 2;
        const leftY = offset + shapeSize + 2;
        const rightX = offset + shapeSize - 2;
        const rightY = offset + shapeSize + 2;
        graphics.fillTriangle(topX, topY, leftX, leftY, rightX, rightY);
        graphics.strokeTriangle(topX, topY, leftX, leftY, rightX, rightY);
        graphics.fillStyle(0xffffff, 0.26);
        graphics.fillTriangle(
          topX,
          topY + 8,
          topX - shapeSize * 0.18,
          topY + shapeSize * 0.48,
          topX + shapeSize * 0.18,
          topY + shapeSize * 0.48,
        );
      }

      graphics.generateTexture(key, size, size);
      graphics.clear();
    }

    // --- Slot Vacío ---
    graphics.fillStyle(0x000000, 0.15);
    graphics.fillRoundedRect(5, 5, size - 10, size - 10, 15);
    graphics.lineStyle(2, 0xffffff, 0.3);
    graphics.strokeRoundedRect(5, 5, size - 10, size - 10, 15);
    graphics.generateTexture("slot", size, size);
    graphics.clear();

    // --- Mano Guía ---
    this.hand = this.add
      .text(0, 0, "👆🏻", { fontSize: "64px" })
      .setOrigin(0.5)
      .setDepth(1000)
      .setAlpha(0);

    graphics.destroy();
  }

  create() {
    this.updateLayoutMetrics();
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Fondo claro y limpio
    this.add.rectangle(centerX, centerY, 1000, 500, 0xf0f3f4);

    // Contenedores para las áreas de la UI
    this.patternContainer = this.add.container(centerX, this.patternY);
    this.slotsContainer = this.add.container(centerX, this.slotsY);
    this.paletteContainer = this.add.container(centerX, this.paletteY);

    // Iniciar el primer nivel
    this.startLevel();
  }

  updateLayoutMetrics() {
    const camera = this.cameras.main;
    const maxPatternLength = 5;
    const usableWidth = camera.width - 160;
    this.itemSpacing = Phaser.Math.Clamp(
      usableWidth / maxPatternLength,
      68,
      90,
    );
    this.itemScale = Phaser.Math.Clamp(this.itemSpacing / 90, 0.78, 1);
    this.patternY = Phaser.Math.Clamp(camera.height * 0.16, 60, 92);
    this.slotsY = Phaser.Math.Clamp(camera.height * 0.5, 210, 260);
    this.paletteY = Phaser.Math.Clamp(camera.height * 0.8, 360, 410);
  }

  // --- Métodos del Nuevo Puzzle ---

  /**
   * Inicia y configura el nivel actual.
   */
  startLevel() {
    this.updateLayoutMetrics();
    const centerX = this.cameras.main.centerX;
    this.patternContainer.setPosition(centerX, this.patternY);
    this.slotsContainer.setPosition(centerX, this.slotsY);
    this.paletteContainer.setPosition(centerX, this.paletteY);

    // Limpiar contenedores y arrays
    this.patternContainer.removeAll(true);
    this.slotsContainer.removeAll(true);
    this.paletteContainer.removeAll(true);
    this.playerPattern = [];
    this.slots = [];
    this.paletteShapes = [];

    this.defineLevel();
    this.renderUI();
    this.updateHandGuide();
  }

  /**
   * Define los datos para cada nivel (el patrón a seguir).
   */
  defineLevel() {
    const levels = {
      1: ["square_red", "circle_blue"],
      2: ["circle_blue", "triangle_yellow", "circle_blue"],
      3: ["square_red", "triangle_yellow", "circle_blue", "square_red"],
      4: ["triangle_yellow", "square_red", "square_red", "triangle_yellow"],
      5: [
        "circle_blue",
        "square_red",
        "triangle_yellow",
        "circle_blue",
        "square_red",
      ],
    };
    this.pattern = levels[this.currentLevel];
    this.playerPattern = new Array(this.pattern.length).fill(null);
  }

  /**
   * Renderiza los elementos de la UI en la pantalla y configura el drag-and-drop.
   */
  renderUI() {
    const startX = -((this.pattern.length - 1) * this.itemSpacing) / 2;

    // 1. Renderizar el patrón a seguir (arriba)
    this.pattern.forEach((shapeKey, index) => {
      const x = startX + index * this.itemSpacing;
      this.patternContainer.add(
        this.add.image(x, 0, shapeKey).setAlpha(0.7).setScale(this.itemScale),
      );
    });

    // 2. Renderizar los slots de construcción (centro)
    this.pattern.forEach((_, index) => {
      const x = startX + index * this.itemSpacing;
      const slot = this.add
        .image(x, 0, "slot")
        .setScale(this.itemScale)
        .setInteractive();
      slot.setData("index", index);
      this.slotsContainer.add(slot);
      this.slots.push(slot);
    });

    // 3. Renderizar la paleta de formas (abajo) y asignarles su lógica de arrastre
    const paletteKeys = Phaser.Utils.Array.Shuffle([
      "square_red",
      "circle_blue",
      "triangle_yellow",
    ]);
    const paletteStartX = -this.itemSpacing;
    paletteKeys.forEach((shapeKey, index) => {
      const x = paletteStartX + index * this.itemSpacing;
      const shape = this.add
        .image(x, 0, shapeKey)
        .setScale(this.itemScale)
        .setInteractive({ draggable: true });
      shape.setData({ key: shapeKey, startX: x, startY: 0 });
      this.paletteContainer.add(shape);
      this.paletteShapes.push(shape);

      // Asignar eventos de arrastre directamente a cada forma
      this.input.setDraggable(shape);

      shape.on("dragstart", (pointer) => {
        this.hand.setAlpha(0);
        shape.setDepth(1);
        this.paletteContainer.bringToTop(shape);
      });

      shape.on("drag", (pointer, dragX, dragY) => {
        // dragX y dragY son coordenadas globales, las convertimos a locales del contenedor
        const localPoint = this.paletteContainer.pointToContainer(pointer);
        shape.setPosition(localPoint.x, localPoint.y);
      });

      shape.on("dragend", (pointer) => {
        const shapeKey = shape.getData("key");
        let droppedCorrectly = false;

        const worldX = pointer.x;
        const worldY = pointer.y;

        for (const [index, slot] of this.slots.entries()) {
          const slotWorldX = slot.x + this.slotsContainer.x;
          const slotWorldY = slot.y + this.slotsContainer.y;

          if (
            Phaser.Math.Distance.Between(
              worldX,
              worldY,
              slotWorldX,
              slotWorldY,
            ) <
            60 * this.itemScale
          ) {
            if (
              this.pattern[index] === shapeKey &&
              this.playerPattern[index] === null
            ) {
              // --- Acción Correcta ---
              const newShape = this.add
                .image(slot.x, slot.y, shapeKey)
                .setScale(this.itemScale);
              this.slotsContainer.add(newShape);
              this.playerPattern[index] = shapeKey;
              this.showFeedback(true, newShape);
              droppedCorrectly = true;
              this.checkSolution();
            }
            // Si estamos sobre un slot (correcto o incorrecto), salimos del bucle.
            break;
          }
        }

        if (droppedCorrectly) {
          // Si la acción fue correcta, la forma de la paleta simplemente vuelve a su sitio.
          this.tweens.add({
            targets: shape,
            x: shape.getData("startX"),
            y: shape.getData("startY"),
            duration: 200,
            ease: "Power1",
          });
        } else {
          // Si la acción fue incorrecta, se activa el feedback de error, que ya incluye el retorno.
          this.showFeedback(false, shape);
        }

        shape.setDepth(0); // Restablecer la profundidad
        this.updateHandGuide();
      });
    });
  }

  /**
   * Valida si el patrón construido por el usuario es correcto.
   */
  checkSolution() {
    if (this.playerPattern.every((shape) => shape !== null)) {
      this.hand.setAlpha(0);
      if (this.handTween) this.handTween.stop();
      this.emitConfetti(45);

      this.time.delayedCall(1200, () => {
        this.currentLevel++;
        if (this.currentLevel > this.maxLevels) {
          this.scene.start("Puzzle3Scene");
        } else {
          this.startLevel();
        }
      });
    }
  }

  emitConfetti(amount) {
    const colors = [0xff4136, 0x0074d9, 0xffdc00, 0x2ecc40, 0xb10dc9];
    for (let i = 0; i < amount; i++) {
      const conf = this.add.rectangle(
        Phaser.Math.Between(30, 970),
        Phaser.Math.Between(-180, -20),
        Phaser.Math.Between(6, 12),
        Phaser.Math.Between(10, 18),
        Phaser.Utils.Array.GetRandom(colors),
      );
      this.tweens.add({
        targets: conf,
        y: Phaser.Math.Between(520, 640),
        x: conf.x + Phaser.Math.Between(-100, 100),
        angle: Phaser.Math.Between(180, 540),
        duration: Phaser.Math.Between(1300, 2400),
        delay: Phaser.Math.Between(0, 500),
        ease: "Quad.easeIn",
        onComplete: () => conf.destroy(),
      });
    }
  }

  /**
   * Controla la "mano guía" para mostrar la siguiente acción correcta.
   */
  updateHandGuide() {
    if (this.handTween) {
      this.handTween.stop();
    }
    this.hand.setAlpha(0).setScale(1);

    const nextEmptyIndex = this.playerPattern.findIndex((s) => s === null);
    if (nextEmptyIndex === -1) return;

    const correctShapeKey = this.pattern[nextEmptyIndex];
    const targetShape = this.paletteShapes.find(
      (s) => s.active && s.getData("key") === correctShapeKey,
    );
    const targetSlot = this.slots[nextEmptyIndex];

    if (targetShape && targetSlot) {
      const safeMargin = 38;
      const minX = safeMargin;
      const maxX = this.cameras.main.width - safeMargin;
      const minY = safeMargin;
      const maxY = this.cameras.main.height - safeMargin;
      const startX = Phaser.Math.Clamp(
        targetShape.x + this.paletteContainer.x,
        minX,
        maxX,
      );
      const startY = Phaser.Math.Clamp(
        targetShape.y + this.paletteContainer.y,
        minY,
        maxY,
      );
      const endX = Phaser.Math.Clamp(
        targetSlot.x + this.slotsContainer.x,
        minX,
        maxX,
      );
      const endY = Phaser.Math.Clamp(
        targetSlot.y + this.slotsContainer.y,
        minY,
        maxY,
      );

      this.hand.setPosition(startX, startY).setAlpha(1);

      // Animar el movimiento de la mano hacia el slot
      this.handTween = this.tweens.add({
        targets: this.hand,
        x: endX,
        y: endY,
        duration: 1000,
        ease: "Cubic.easeInOut",
        delay: 300,
        onComplete: () => {
          // Cuando llega, animar el "toque"
          this.tweens.add({
            targets: this.hand,
            scale: 0.8,
            duration: 300,
            yoyo: true,
            ease: "Sine.easeInOut",
            onComplete: () => {
              // Después del toque, esperar y reiniciar la guía
              this.time.delayedCall(1000, () => this.updateHandGuide());
            },
          });
        },
      });
    }
  }

  /**
   * Muestra feedback visual (animaciones, colores) para las acciones del usuario.
   */
  showFeedback(isCorrect, gameObject) {
    if (isCorrect) {
      this.tweens.add({
        targets: gameObject,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 150,
        yoyo: true,
        ease: "sine.inout",
      });
    } else {
      gameObject.setTint(0xff0000);
      this.tweens.add({
        targets: gameObject,
        x: "+=10",
        duration: 50,
        yoyo: true,
        repeat: 3,
        onComplete: () => {
          gameObject.clearTint();
          this.tweens.add({
            targets: gameObject,
            x: gameObject.getData("startX"),
            y: gameObject.getData("startY"),
            duration: 200,
            ease: "Power1",
          });
        },
      });
    }
  }
}

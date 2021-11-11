'use strict';

(function() {
    const IMAGES = [
        'https://previews.123rf.com/images/mls522/mls5221709/mls522170900018/86018796-cycler.jpg',
        'https://previews.123rf.com/images/vencavolrab78/vencavolrab781112/vencavolrab78111200073/11744036-mountain-biker-silhouette-in-sunrise.jpg'
    ];


    class PuzzleEngine {
        isSimpleGame = false;
        puzzleEl = document.querySelector('#puzzle');
        image = {
            src: '',
            w: 0,
            h: 0,
            templateEl: document.querySelector('#background'),
            imageEl: document.querySelector('#background')
        };
        tileSet = null;

        constructor() {
            this.isSimpleGame = confirm(`Would you like to show simplified puzzle?`);
            this.image.src = IMAGES[getRandomInt(0, IMAGES.length - 1)];
            this.image.imageEl.addEventListener('load', () => setTimeout(this.onCacheLoad.bind(this), 10));
            this.image.imageEl.src = this.image.src;
        }

        onCacheLoad() {
            this.recalculateSize();

            this.tileSet = new TileSet(this);

            this.render();


            window.addEventListener('resize', _ => this.render());
        }

        render() {
            this.recalculateSize();

            this.tileSet.render();
        }

        recalculateSize() {
            this.image.w = this.image.imageEl.width;
            this.image.h = this.image.imageEl.height;
            this.puzzleEl.style.width = `${this.image.w}px`;
            this.puzzleEl.style.height = `${this.image.h}px`;
        }
    }

    class TileSet {
        engine = null;
        viewportEl = null;
        viewportWidth = 0;
        viewportHeight = 0;
        tiles = [];
        originalTiles = [];

        constructor(engine) {
            this.engine = engine;
            this.viewportEl = document.querySelector('.viewport');

            for (let j = 0; j < 3; ++j) {
                for (let i = 0; i < 4; ++i ) {
                    let tile = new Tile(engine, this, i, j);
                    this.originalTiles.push(tile);
                }
            }

            this.tiles = this.originalTiles.slice();
            this.shuffleTiles();
        }

        render() {
            const img = this.engine.image;
            this.viewportHeight = parseInt(window.getComputedStyle(img.imageEl).height);
            this.viewportWidth = img.width * (this.viewportHeight / img.height);

            this.viewportEl.style.width = `${this.viewportWidth}px`;

            this.viewportEl.innerHTML = '';
            this.tiles.forEach(t => this.viewportEl.append(t.content));
            this.tiles.forEach(t => t.render());
        }

        shuffleTiles() {
            const shuffleTimes = this.engine.isSimpleGame ? 2 : 100;

            for (let i = 0; i < shuffleTimes; ++i) {
                const a = getRandomInt(0, this.tiles.length - 1);
                const b = getRandomInt(0, this.tiles.length - 1);
                const temp = this.tiles[a];
                this.tiles[a] = this.tiles[b];
                this.tiles[b] = temp;
            }
        }

        swapTiles(fromTileCoords, toTile) {
            const fromTile = this.tiles.find( tile => tile.i === fromTileCoords.i && tile.j === fromTileCoords.j);

            for (let i = 0; i < this.tiles.length; ++i) {
                if (this.tiles[i] === fromTile) {
                    this.tiles[i] = toTile;
                } else if (this.tiles[i] === toTile) {
                    this.tiles[i] = fromTile;
                }
            }

            this.render();

            if (this.originalTiles.every((ot, i) => this.tiles[i] === ot)) {
                setTimeout(() => alert(`Congratulations! You have successfully solved the puzzle!`), 0);
            }
        }
    }

    class Tile {
        content = null;
        tileSet = null;
        i = 0;
        j = 0;

        constructor(engine, tileSet, i, j) {
            const div = document.createElement('div');
            div.setAttribute('draggable', true);
            this.content = div;
            this.engine = engine;
            this.tileSet = tileSet;
            this.i = i;
            this.j = j;

            div.addEventListener('touchmove', e => this.onTouchMove(e));
            div.addEventListener('dragstart', e => this.onDragStart(e));
            div.addEventListener('drop', e => this.onDrop(e));
            div.addEventListener('dragover', e => this.onDragOver(e));
            div.addEventListener('dragleave', e => this.onDragEnd());
            div.addEventListener('dragend', e => this.onDragEnd());

            this.render();
        }

        render() {
            this.content.style.border = ``;
            this.content.style.backgroundImage = `url(${this.engine.image.src})`;
            this.content.style.backgroundSize = `${this.engine.image.w}px ${this.engine.image.h}px`;
            this.content.style.backgroundPosition = `-${this.engine.image.w / 4 * this.i}px -${this.engine.image.h / 3 * this.j}px`;
        }

        onTouchMove(event) {
            console.log(event);
        }
        onDragStart(event) {
            event.dataTransfer.dropEffect = 'move';
            event.dataTransfer.setData('fromTileCoords', JSON.stringify({i: this.i, j: this.j}));
        }
        onDrop(event) {
            event.preventDefault();
            this.tileSet.swapTiles(JSON.parse(event.dataTransfer.getData('fromTileCoords')), this);
        }
        onDragOver(event) {
            event.preventDefault();
            this.content.style.border = `5px solid white`;
        }
        onDragEnd() {
            this.render();
        }
    }

    new PuzzleEngine();



    // helper functions

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return min + Math.floor(Math.random() * (max - min + 1));
    }
})();





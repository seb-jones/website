//
// Dependencies
//

let toasted = new Toasted({
    position: 'bottom-right',
    duration: 4000,
});

//
// Constants
//

const gridSize = 12;
const quadrantSize = 10;
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const sectorNames = ["Seppius","Orcivius","Tuccius","Sicinius","Placidius","Poppaeus","Pacilius","Terentilius","Aquinius","Bantius","Apronius","Manlius","Icilius","Matius","Proculeius","Petillius","Saenius","Atrius","Gavius","Servaeus","Arellius","Thorius","Gratidius","Hirrius","Rufinius","Laenius","Hirtuleius","Scuilius","Numisius","Oppidius","Tarpeius","Helvidius","Avianus","Herennius","Papius","Crassitius","Sabinius","Bruttius","Abronius","Pedanius","Faenius","Pleminius","Arminius","Norbanus","Pontilius","Didius","Lepidius","Hirtius","Lafrenius","Aebutius","Decimius","Sosius","Tarquinius","Mallius","Visellius","Cordius","Seccius","Caerellius","Dellius","Naevius","Falcidius","Orbilius","Genucius","Sepunius","Percennius","Sentius","Coelius","Duronius","Novellius","Gratius","Furnius","Statius","Popaedius","Condetius","Junius","Betucius","Papirius","Socellius","Ofanius","Menius","Caecius","Vitrasius","Pompilius","Fulginas","Ampius","Juventius","Sabucius","Postumulenus","Pollius","Atius","Caesius","Quartinius","Herennuleius","Hortensius","Gabinius","Ceionius","Bellius","Pomptinus","Mamercius","Memmius"];

//
// Global Data
//

let global = {
    data: {
        starDate: 47501.4,

        screen: {
            current: 'Quadrant',
            screens: {
                'Quadrant': {
                    highlightedSectorIndex: null,
                    viewingSectorIndex: null,
                    queuedOrder: null,
                    mapType: 'Normal',
                },
                'Intel': {},
                'War Room': {},
                'Treasury': {},
            },
        },

        sectors: [],

        reports: [
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla.',
            'Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel nunc egestas porttitor. Morbi lectus risus, iaculis vel, suscipit quis, luctus non, massa. Fusce ac turpis quis ligula lacinia aliquet. Mauris ipsum. Nulla metus metus, ullamcorper vel, tincidunt sed, euismod in, nibh.',
        ],
        orders: [],
    }
};

//
// Functions
//

function sectorStyle(data, i) {
    i = gridIndexToSectorIndex(i);

    if (i !== null && mapType(data.screen) === 'Owners') {
        const sector = data.sectors[i];

        if (sector.owner) {
            if (sector.owner === 'Player') {
                return 'background-color: rgba(0, 0, 150, 0.75)';
            } else if (sector.owner === 'Computer') {
                return 'background-color: rgba(150, 0, 0, 0.75)';
            }
        }
    }

    return '';
}

function quadrantBorderClasses(i) {
    if (i <= gridSize) {
        return 'flex-col border-0';
    }

    if ((i - 1) % gridSize === 0) {
        return 'justify-end p-2';
    }

    if (i > 132 || (i % gridSize === 0)) {
        return 'border-0';
    }

    return 'quadrant-sector-hover border-l border-t border-teal-200 ' + 
        (((i + 1) % gridSize === 0) ? 'border-r' : 'border-r-0') + ' ' +
        ((i > 120) ? 'border-b' : 'border-b-0');
}

function quadrantText(i) {
    if (i >= 2 && i <= 11) {
        return alphabet.charAt(i - 2);
    }

    if (i > 1 && i < 132 && (i - 1) % gridSize === 0) {
        return Math.floor(i / gridSize);
    }

    return '';
}

function starDateText() {
    return 'Star Date: ' + global.data.starDate.toFixed(1);
}

function nextTurn(data) {
    data.starDate += .1;

    // Execute Orders
    data.orders.forEach(order => {
        if (order.type === 'ship-move') {
            const sourceIndex = order.sourceSectorIndex;
            const destinationIndex = order.destinationSectorIndex;

            data.sectors[destinationIndex].ships += order.ships;
        }
    });

    // Add executed orders to reports
    data.reports = data.orders.map(order => orderText(order));

    data.orders = [];

    return data;
}

function gridIndexToSectorIndex(i) {
    let y = Math.floor(i / gridSize);
    let x = i - (y * gridSize) - 1;

    if (x < 1 || x > 10 || y < 1 || y > 10) {
        return null;
    }

    return (y - 1) * quadrantSize + (x - 1);
}

function sectorIndexToSectorCoordinates(i) {
    let y = Math.floor(i / quadrantSize);
    let x = i - (y * quadrantSize);

    return { letter: alphabet.charAt(x), number: y + 1 };
}

function getHighlightedSector(screen) {
    const i = screen.screens["Quadrant"].highlightedSectorIndex;
    return global.data.sectors[i];
}

function sectorName(screen) {
    const sector = getHighlightedSector(screen);
    const coords = sectorIndexToSectorCoordinates(i);

    return "Sector: " + sector.name + " (" + coords.letter + ", " + coords.number + ")";
}

function sectorOwner(screen) {
    const sector = getHighlightedSector(screen);

    if (sector.owner) {
        return 'Owner: ' + sector.owner;
    }

    return '';
}

function sectorShips(screen) {
    const sector = getHighlightedSector(screen);

    if (sector.ships) {
        return 'Ships: ' + sector.ships;
    }

    return '';
}

function newShipMoveOrder(sectorIndex) {
    return {
        type: 'ship-move',
        sourceSectorIndex: sectorIndex,
        destinationSectorIndex: null,
        ships: 0,
    };
}

function getQuadrantQueuedOrder(screen) {
    return screen.screens['Quadrant'].queuedOrder;
}

function quadrantQueuedOrderText(screen) {
    const queuedOrder = getQuadrantQueuedOrder(screen);
    const sourceCoords = sectorIndexToSectorCoordinates(queuedOrder.sourceSectorIndex);

    return `Queued Order: Move ${queuedOrder.ships} Ships from (${sourceCoords.letter}, ${sourceCoords.number})`;
}
function orderText(order) {
    const sourceCoords = sectorIndexToSectorCoordinates(order.sourceSectorIndex);
    const destCoords = sectorIndexToSectorCoordinates(order.destinationSectorIndex);

    return `Move ${order.ships} Ships from (${sourceCoords.letter}, ${sourceCoords.number}) to (${destCoords.letter}, ${destCoords.number})`;
}

function handleSectorRightClick(data, i) {
    i = gridIndexToSectorIndex(i);

    let sector = data.sectors[i];
    let queuedOrder = getQuadrantQueuedOrder(data.screen);

    if (!queuedOrder) {
        if (sector.ships === 0) {
            return data;
        }

        queuedOrder = newShipMoveOrder(i);
    }

    if (i === queuedOrder.sourceSectorIndex) {
        if (sector.ships > 0) {
            queuedOrder.ships++;
            sector.ships--;
        }
    } else {
        queuedOrder.destinationSectorIndex = i;

        data.orders.push(queuedOrder);

        toasted.success('Order Issued: ' + orderText(queuedOrder));

        queuedOrder = null;
    }

    data.sectors[i] = sector;
    data.screen.screens['Quadrant'].queuedOrder = queuedOrder;

    return data;
}

function setScreen(screen, name) {
    screen.current = name;

    if (name === "Quadrant") {
        screen.screens[name].viewingSectorIndex = null;
        screen.screens[name].highlightedSectorIndex = null;
    }

    return screen;
}

function viewingQuadrantScreen(screen) {
    return screen.current === "Quadrant" && !screen.screens["Quadrant"].viewingSectorIndex;
}

function viewingSectorScreen(screen) {
    return screen.current === "Quadrant" && screen.screens["Quadrant"].viewingSectorIndex;
}

function sectorHighlighted(screen) {
    return screen.screens["Quadrant"].highlightedSectorIndex !== null;
}

function setQuadrantHighlightedSector(screen, i) {
    screen.screens["Quadrant"].highlightedSectorIndex = i;
    return screen;
}

function setQuadrantViewingSector(screen, i) {
    screen.screens["Quadrant"].viewingSectorIndex = i;
    return screen;
}

function backToQuadrantScreen(screen) {
    screen.screens["Quadrant"].viewingSectorIndex = null;
    screen.screens["Quadrant"].highlightedSectorIndex = null;
    return screen;
}

function mapType(screen) {
    return screen.screens["Quadrant"].mapType;
}

function cycleMapType(screen) {
    if (screen.screens["Quadrant"].mapType === 'Normal') {
        screen.screens["Quadrant"].mapType = 'Owners';
    } else {
        screen.screens["Quadrant"].mapType = 'Normal';
    }

    return screen;
}

//
// Script
//

// Create Initial Sectors
for (i = 0; i < quadrantSize * quadrantSize; i++) {
    let owner = null;
    let ships = 0;

    if ([0, 1, 10].includes(i)) {
        owner = "Player";
        ships = 2;
    } else if ([89, 98, 99].includes(i)) {
        owner = "Computer";
        ships = 2;
    }

    global.data.sectors.push({
        name: sectorNames[i],
        owner: owner,
        ships: ships,
    });
}

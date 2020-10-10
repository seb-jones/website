var toasted = new Toasted({
    position: 'bottom-right',
    duration: 4000,
});

const gridSize = 12;
const quadrantSize = 10;
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const sectorNames = ["Seppius","Orcivius","Tuccius","Sicinius","Placidius","Poppaeus","Pacilius","Terentilius","Aquinius","Bantius","Apronius","Manlius","Icilius","Matius","Proculeius","Petillius","Saenius","Atrius","Gavius","Servaeus","Arellius","Thorius","Gratidius","Hirrius","Rufinius","Laenius","Hirtuleius","Scuilius","Numisius","Oppidius","Tarpeius","Helvidius","Avianus","Herennius","Papius","Crassitius","Sabinius","Bruttius","Abronius","Pedanius","Faenius","Pleminius","Arminius","Norbanus","Pontilius","Didius","Lepidius","Hirtius","Lafrenius","Aebutius","Decimius","Sosius","Tarquinius","Mallius","Visellius","Cordius","Seccius","Caerellius","Dellius","Naevius","Falcidius","Orbilius","Genucius","Sepunius","Percennius","Sentius","Coelius","Duronius","Novellius","Gratius","Furnius","Statius","Popaedius","Condetius","Junius","Betucius","Papirius","Socellius","Ofanius","Menius","Caecius","Vitrasius","Pompilius","Fulginas","Ampius","Juventius","Sabucius","Postumulenus","Pollius","Atius","Caesius","Quartinius","Herennuleius","Hortensius","Gabinius","Ceionius","Bellius","Pomptinus","Mamercius","Memmius"];

var global = {
    data: {
        starDate: 47501.4,

        screen: 'Quadrant',
        sectors: [],

        highlightedSectorIndex: null,
        viewingSectorIndex: null,

        topbarItems: [
            'Quadrant',
            'Intel',
            'War Room',
            'Treasury',
        ],

        sidebarItems: [
            'Welcome',
            'To',
            'The',
            'Party',
        ],

        reports: [
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla.',
            'Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel nunc egestas porttitor. Morbi lectus risus, iaculis vel, suscipit quis, luctus non, massa. Fusce ac turpis quis ligula lacinia aliquet. Mauris ipsum. Nulla metus metus, ullamcorper vel, tincidunt sed, euismod in, nibh.',
        ],
        orders: [
            'Quisque volutpat condimentum velit. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Nam nec ante. Sed lacinia, urna non tincidunt mattis, tortor neque adipiscing diam, a cursus ipsum ante quis turpis. Nulla facilisi. Ut fringilla. Suspendisse potenti. Nunc feugiat mi a tellus consequat imperdiet. Vestibulum sapien. Proin quam. Etiam ultrices. Suspendisse in justo eu magna luctus suscipit.',
            'Sed lectus. Integer euismod lacus luctus magna. Quisque cursus, metus vitae pharetra auctor, sem massa mattis sem, at interdum magna augue eget diam. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Morbi lacinia molestie dui. Praesent blandit dolor. Sed non quam. In vel mi sit amet augue congue elementum. Morbi in ipsum sit amet pede facilisis laoreet. Donec lacus nunc, viverra nec, blandit vel, egestas et, augue. Vestibulum tincidunt malesuada tellus. Ut ultrices ultrices enim. Curabitur sit amet mauris. Morbi in dui quis est pulvinar ullamcorper.',
        ],
    }
};

for (i = 0; i < quadrantSize * quadrantSize; i++) {
    global.data.sectors.push({
        name: sectorNames[i],
    });
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
    toasted.success('Did summin')
    data.starDate += .1;
    data.screen = 'Intel';
    return data;
}

function gridIndexToSectorIndex(i) {
    var y = Math.floor(i / gridSize);
    var x = i - (y * gridSize) - 1;

    if (x < 1 || x > 10 || y < 1 || y > 10) {
        return null;
    }

    return (y - 1) * quadrantSize + (x - 1);
}

function sectorIndexToSectorCoordinates(i) {
    var y = Math.floor(i / quadrantSize);
    var x = i - (y * quadrantSize);

    return { letter: alphabet.charAt(x), number: y + 1 };
}

function sectorText(i) {
    var sector = global.data.sectors[i];
    var coords = sectorIndexToSectorCoordinates(i);
    return "Sector: " + sector.name + " (" + coords.letter + ", " + coords.number + ")";
}
        
function setScreen(data, screen) {
    data.screen = screen;

    if (screen === "Quadrant") {
        data.viewingSectorIndex = null;
    }

    return data;
}

export function rainMmToSeverity(mm: number) {
    if (mm < 0.1) {
        return 'Trocken';
    } else if (mm < 2.5) {
        return 'Leichter Regen';
    } else if (mm < 7.61) {
        return 'Mittelschwerer Regen';
    } else if (mm < 50) {
        return 'Starkregen';
    } else {
        return 'Heftiger Regen';
    }
}
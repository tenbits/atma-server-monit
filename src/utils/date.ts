export function date_getMidnight (date: Date, diffDays: number = 0) {
    date.setHours(0, 0, 0, 0);
    if (diffDays !== 0) {
        date.setDate(date.getDate() + diffDays);
    }
    return date.getTime();
}
export function date_sameDate (a: Date, b: Date) {
    return a.getDate() === b.getDate()
        && a.getMonth() === b.getMonth()
        && a.getFullYear() === b.getFullYear();
}

export function date_nextDay (a: Date) {
    let date = new Date(a);
    date.setDate(date.getDate() + 1);
    date.setHours(0, 0 , 0, 0);
    return date;
}

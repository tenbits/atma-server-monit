export function date_getMidnight (date: Date, diffDays: number = 0) {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    if (diffDays !== 0) {
        date.setDate(date.getDate() + diffDays);
    }
    return date.getTime();
}
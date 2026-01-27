export const getTodaysDay = () => {
    return new Date().toLocaleString("en-US", {
        weekday : "long"
    })
}
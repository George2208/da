function formatMessage(message, user = "Bot") {
    let time = new Date()
    return {
        user, message,
        "time": time.toLocaleTimeString()
    }
}

module.exports = formatMessage;
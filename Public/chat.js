let socket = new io()
let url = new URL(window.location.href)

if(url.searchParams.has("room")) {
    socket.emit("joinRoom", url.searchParams.get("room"))
}

document.getElementById("room").onchange = () => {
    url.searchParams.set("room", document.getElementById("room").value)
    socket.emit("joinRoom", url.searchParams.get("room"))
    history.pushState(new Date, "Hearthstone", url)
}


document.getElementById("messageForm").addEventListener("submit", (e) => { sendMessage(e) })
document.getElementById("textarea").addEventListener("keypress", (e) => { if(e.which === 13) sendMessage(e) })
socket.on("message", (message) => { appendMessage(message) })
function appendMessage (params) {
    document.getElementById("messageBox").insertAdjacentHTML("beforeend", `
    <div class="message">
    <b>${params.user}</b>
    <span>${params.time}</span>
    <div>${params.message}</div>`)
    document.getElementById("messageBox").scrollTop = document.getElementById("messageBox").scrollHeight;
}
function sendMessage (e) {
    e.preventDefault()
    if (document.getElementById("textarea").innerHTML == "") {
        alert("na situatie")
        return
    }
    socket.emit("message", document.getElementById("textarea").innerHTML)
    let time = new Date()
    document.getElementById("messageBox").insertAdjacentHTML("beforeend", `
        <div class="message my">
        <b>You</b>
        <span>${time.toLocaleTimeString()}</span>
        <div>${document.getElementById("textarea").innerHTML}</div>`)
    document.getElementById("textarea").innerHTML = ""
    document.getElementById("messageBox").scrollTop = document.getElementById("messageBox").scrollHeight;
}
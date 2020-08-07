let canvas = document.getElementById("background")
canvas.style.backgroundColor = "black"
let ctx = canvas.getContext("2d")
let width = canvas.getBoundingClientRect().width
let height = canvas.getBoundingClientRect().height
ctx.canvas.width = width
ctx.canvas.height = height


let mouse = { x: null, y: null, radius: 100 }
window.addEventListener("mousemove", (e) => {
    mouse.x = e.x
    mouse.y = e.y
})

class Boundary {
    constructor(x, y, radius) {
        this.x = x-radius
        this.y = y-radius
        this.radius = radius
        this.width = radius*2
        this.height = radius*2
    }
}

class Particle {
    constructor(x, y, dx, dy) {
        this.x = x
        this.y = y
        this.dx = dx
        this.dy = dy
        this.draw()
    }
    draw(color = "white", size = 0.5) {
        ctx.beginPath()
        ctx.fillStyle = color;
        ctx.arc(this.x, this.y, size, 0, Math.PI * 2)
        ctx.fill();
    }
    update() {
        if (this.x > width || this.x < 0)
            this.dx *= -1
        if (this.y > height || this.y < 0)
            this.dy *= -1
        this.x += this.dx
        this.y += this.dy
    }
    insideRectange(boundary) {
        return this.x > boundary.x && this.x < boundary.x + boundary.width && this.y > boundary.y && this.y < boundary.y + boundary.height
    }
    insideCircle(boundary) {
        let x = boundary.x + boundary.radius
        let y = boundary.y + boundary.radius
        return (this.x - x) * (this.x - x) + (this.y - y) * (this.y - y) < boundary.radius * boundary.radius
    }
}

class QuadTree {
    constructor(x, y, width, height) {
        this.x = x, this.y = y, this.width = width, this.height = height
        this.list = []
        this.capacity = 5
        this.split = false

        // ctx.beginPath();
        // ctx.rect(this.x, this.y, this.width, this.height);
        // ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
        // ctx.stroke();
    }
    passPoint(point) {
        if(point.x >= this.x + this.width / 2) { // east
            if(point.y < this.y + this.height / 2) { // north
                this.ne.add(point)
            } else {
                this.se.add(point)
            }
        } else {
            if(point.y < this.y + this.height / 2) {
                this.nw.add(point)
            } else {
                this.sw.add(point)
            }
        }
    }

    add(point) {
        if(this.split) {
            this.passPoint(point)
            return
        }
        this.list.push(point)
        if(this.list.length > this.capacity) {
            this.split = true
            let w = this.width / 2
            let h = this.height / 2
            this.nw = new QuadTree(this.x, this.y, w, h)
            this.ne = new QuadTree(this.x + w, this.y, w, h)
            this.sw = new QuadTree(this.x, this.y + h, w, h)
            this.se = new QuadTree(this.x + w, this.y + h, w, h)
            while(this.list.length > 0) {
                this.passPoint(this.list.pop())
            }
        }
    }

    query(boundary) {
        if(!this.contains(boundary)) {
            return []
        }
        if(this.split == false) {
            // ctx.beginPath();
            // ctx.rect(this.x, this.y, this.width, this.height);
            // ctx.strokeStyle = "red"
            // ctx.stroke();   
            return this.list
        }
        else {
            let result = this.nw.query(boundary)
            result = result.concat(this.ne.query(boundary))
            result = result.concat(this.sw.query(boundary))
            result = result.concat(this.se.query(boundary))
            return result
        }
    }
    
    contains(boundary) {
        let x = (this.x > boundary.x + boundary.width ||
            this.y > boundary.y + boundary.height ||
            this.x + this.width < boundary.x ||
            this.y + this.height < boundary.y)
        if(!x) {
            
        }
        return !x
    }
}

function animate() {
    requestAnimationFrame(animate)
    ctx.clearRect(0, 0, width, height)
    newTime = new Date().getMilliseconds()
    document.getElementById("frames").innerHTML = 1000 / (newTime - time)
    time = newTime

    let qtree = new QuadTree(0, 0, width, height)
    for (let i = 0; i < particlesArray.length; i++)
        qtree.add(particlesArray[i])
    for (let i = 0; i < particlesArray.length; i++)
        particlesArray[i].draw()
    
    let boundary = new Boundary(mouse.x, mouse.y, 200)
    let area1 = qtree.query(boundary)
    for (let i = 0; i < area1.length; i++) {
        if(area1[i].insideCircle(boundary)) {
            // area1[i].draw("red", 4)
            let boundary2 = new Boundary(area1[i].x, area1[i].y, 120)
            let area2 = qtree.query(boundary2)
            for (let j=0; j<area2.length; j++) {
                if(area2[j].insideCircle(boundary2)) {
                    // area2[j].draw("green", 5)
                    ctx.strokeStyle = "rgba(255, 255, 255, "+0.4+")"
                    ctx.lineWidth = 1
                    ctx.beginPath()
                    ctx.moveTo(area1[i].x, area1[i].y)
                    ctx.lineTo(area2[j].x, area2[j].y)  
                    ctx.stroke()
                }
            }
        }
        
    }

    for (let i = 0; i < particlesArray.length; i++)
        particlesArray[i].update()

    // ctx.beginPath()
    // ctx.rect(boundary.x, boundary.y, boundary.width, boundary.height)
    // ctx.strokeStyle = "white"
    // ctx.stroke()

    // ctx.beginPath()
    // ctx.strokeStyle = "white";
    // ctx.arc(boundary.x+boundary.radius, boundary.y+boundary.radius, boundary.radius, 0, Math.PI * 2)
    // ctx.stroke();
}

let time = new Date().getSeconds()
let particlesArray = []
for (let i = 0; i < 200; i++) particlesArray.push(new Particle(Math.random() * width, Math.random() * height, Math.random() * 5 - 2.5, Math.random() * 5 - 2.5))
animate()

let qtree = new QuadTree(0, 0, width, height)

document.onclick = () => {
    canvas.requestFullscreen();
}
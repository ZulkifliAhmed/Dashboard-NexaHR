// Toggle Aside
const btn = document.querySelector(".big");
const toggleAside = document.querySelector("aside")

btn.addEventListener("click",function(){
    toggleAside.classList.toggle("toggleAside");
})

// Show Mobile Nav
const showNav = document.querySelector(".mobile");
const mobileNav = document.querySelector("aside")
const closeNav = document.querySelector(".close")

showNav.addEventListener("click",function(){
    mobileNav.style.left = "0";
})

closeNav.addEventListener("click",function(){
    mobileNav.style.left = "-200px";
})

//User Links
const userLinks = document.querySelector(".user-links")
const dropNav = document.querySelector(".drop-nav")

userLinks.addEventListener("click",function(){
    dropNav.classList.toggle("show")
})

//EmployeeItem Details
const employeeLink = document.querySelector(".employeeLink")
const moreDetails = document.querySelector(".moreDetails")

employeeLink.addEventListener("click",function(){
    moreDetails.classList.toggle("show")
})

// aside active links
const asideNav = document.querySelectorAll("nav li")
asideNav.forEach((item)=>{
    item.addEventListener("click", function(){
        asideNav.forEach((e)=>{
            e.classList.remove("active")
        })
        this.classList.add("active")
    })
})

// Employees Carts Detaile
const carts = document.querySelectorAll(".carts .range")
carts.forEach((el)=>{
    countNumber(el)
})
function countNumber(item){
    const maxNum = item.dataset.range
     let count = setInterval(()=>{
        item.textContent++
        if (item.textContent == maxNum) {
            clearInterval(count)
        }
     },2000 / maxNum)
}

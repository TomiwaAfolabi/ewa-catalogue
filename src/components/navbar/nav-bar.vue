<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter,useRoute } from 'vue-router'
import HomeIcon from "../../../public/icons/home-icon.vue"
import InventoryIcon from "../../../public/icons/inventory.vue"
import NavIcon from "../../../public/icons/nav-icon.vue"
import CloseIcon from "../../../public/icons/cancel-icon.vue"

const router =useRouter()
const route = useRoute()
const navLinks=ref<any>([{
    linkName:'home',
    linkPath:'/',
},{
    linkName:'Inventory',
    linkPath:'/catalogue-home'
}
])
function routeNav(val:any){
    let linkVal
    if(val=='Inventory'){
        linkVal='catalogue-home'
    }else{
        linkVal=val
    }
   showNav.value=false 
router.push({name:linkVal})

}
function toggleNav(){
    showNav.value=!showNav.value
}
function closeNav(){
    showNav.value=false
}

const routeName=computed(()=> route?.path)
const showNav=ref(false)
</script>

<template>
 <div class=" relative navcontainer flex mx-auto  items-center">
 <div class="  w-full  nav-container-height absolute">
 </div>
 <div class=" relative  w-full h-full flex justify-between items-center ml-10  ">
    <div @click="routeNav('home')"> 
       <img src="/logo/EwaLogo.jpg" class="w-14 h-14 rounded-lg"/>
       
    </div>
 <div  class=" hidden sm:flex gap-6 overflow-scroll mr-10 "  >
    <div class="flex items-center gap-1 " v-for="(link,i) in navLinks" :key="i">
        <HomeIcon class="w-6 h-6" v-if="link?.linkName=='home'"/>
        <InventoryIcon class="w-7 h-7" v-if="link?.linkName=='Inventory'"/>
        <div class="flex  h-10  navLink font-bold justify-center items-center rounded-lg capitalize cursor-pointer " :class="link?.linkPath === routeName ?'underline':''"  @click="routeNav(link?.linkName )">
         {{ link?.linkName }}
        </div>
    </div>
 </div>
   <div class="flex sm:hidden mr-4  p-0.5 rounded-sm" @click="toggleNav()">
    <NavIcon class="w-7 h-7 "/>
    </div>
 </div>
 </div>

  <div v-if="showNav" class="w-full h-screen mobileNav absolute z-10 top-0 block sm:hidden">
 </div>
  <div v-if="showNav" class=" w-full absolute z-10 top-0  block sm:hidden">
    <div class="w-full flex justify-end pt-2 pr-4">
    <div class="relative bg-white w-8 rounded-full right-0" @click="closeNav()"><CloseIcon class="w-8 h-8"/></div>
    </div>
    <div  class="flex flex-col gap-4">
        <div class="flex items-center " v-for="(link,i) in navLinks" :key="i">
        <div class=" w-full flex  h-10  navLink font-bold justify-center items-center rounded-lg capitalize cursor-pointer gap-1 " :class="link?.linkPath === routeName ?'bg-white text-black!':''"  @click="routeNav(link?.linkName )">
        <HomeIcon class="w-6 h-6" v-if="link?.linkName=='home'"/>
        <InventoryIcon class="w-7 h-7" v-if="link?.linkName=='Inventory'"/>
         <p>{{ link?.linkName }}</p>
        </div>
    </div>
    </div>
 </div>


</template>

<style scoped>
.mobileNav{
    background-color: black;
    opacity: 80%;
}
.nav-container-height{
    height: 100%;
    opacity: 80%;
    border-width: 0.5px;
    border-top: 0px;
    border-left: 0px;
    border-right: 0px;
    border-color: #ffffe3;
    box-shadow: #636b2f;
}
.navcontainer{
    width:100%;
    height: 10%;
}
.navLink{
     color: #C4D8E2;
}

</style>
#738678 #00674f
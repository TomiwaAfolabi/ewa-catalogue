<script setup lang="ts">
import CatalogueContainerCard from "../catalogue/catalogue-card.vue" 
import { ref, computed } from 'vue'
import {useRouter } from 'vue-router'
import catatlogueCardDetails from "../../static/catalogue-details.json"

const router =useRouter()
const catalogueList=catatlogueCardDetails as any


function routeCataloguePage(item:any){
router.push({name:'catalogue-page',params:{id: item?.id}})
}

</script>

<template>
 <div class="w-full relative pb-4 pt-4 ">
 <div class=" containerHeight w-full mt-4 border-2 absolute">   
 </div>
 <div  class=" grid grid-cols-1 sm:grid-cols-3 relative mt-10 catalogueContainer   gap-8 overflow-scroll justify-items-center mb-4  p-4"  >
    <div   v-for="(catalogue, i) in catalogueList" :key="i" class="w-full h-80 ">
    <CatalogueContainerCard :cardDetails="catalogue" @click="routeCataloguePage(catalogue)"/>
    </div>
    
 </div>

 </div>

</template>

<style scoped>
.containerHeight{
    height: 82%;
    border-color: #ffffe3;
     opacity:35%;
}
.catalogueContainer{
    width:100%;
    height: 78%;
}

</style>
<script setup lang="ts">
import MoneyIcon from "../../../public/icons/money-icon.vue"
const {cardDetails} = defineProps({
  cardDetails: Array,
}) as any
</script>

<template>
 <div class=" catalogue-card-container  mt-4 relative cursor-pointer ">
    <div class="w-full   overflow-scroll border-0 ">
      <img :src="cardDetails?.imgSrc" class="w-full h-64 object-cover rounded-lg  "/>
    </div>
    <div class="font-semibold">
      <p>{{cardDetails?.title}}</p>
        <p class="flex items-center gap-2"><MoneyIcon class="w-9 h-9"/>{{`${cardDetails?.currency_symbol} ${cardDetails?.price}`}}</p>
    </div>
 </div>

</template>

<style scoped>
.catalogue-card-container{
    width: 100%;
    height: 100%;
    border-color: rgba(76, 76, 76, 0.851);
    color: #C4D8E2;
    
}


</style>
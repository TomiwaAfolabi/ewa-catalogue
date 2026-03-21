<script setup lang="ts">
import { ref, computed,onMounted } from 'vue'
import catatlogueCardDetails from "../static/catalogue-details.json"
import { useRoute,useRouter } from 'vue-router'
import WhatsAppIcon from "../../public/icons/whatsapp-icon.vue"
import MeasuringTapeIcon from "../../public/icons/measuring-tape.vue"
import PaymentIcon from "../../public/icons/payment-icon.vue"

const catalogueList= ref(catatlogueCardDetails) as any
const route = useRoute()
const itemId=computed(()=> route?.params?.id)
const cardDetail= computed(()=>{
    let card={} as any
      catalogueList.value.forEach((el:any)=> {
        if(el?.id == itemId?.value?.toString()){
            card=el
        }
     }) 
  return card
})
let slideIndex = 1;

// Next/previous controls
function plusSlides(n) {
  showSlides(slideIndex += n);
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("mySlides") as any;
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  if(slides?.length){
  slides[slideIndex-1].style.display = "block";
  }


}
 function shareByWhatsApp(item:any){
        location.href = `http://api.whatsapp.com/send?phone=23058533374&text=Good Day, I am interested in purchasing the ${item} listed on your website.`;
    }

onMounted(()=>{
    showSlides(slideIndex);
})

</script>

<template>
 <div class="w-full  h-screen relative pb-4 pt-4 ">
 <div class=" cpageHeight w-full mt-4 border-2 absolute">   
 </div>
 <div  class="flex flex-col w-full relative  cpContainer   gap-2 overflow-scroll  sm:mb-4 pl-2 sm:pl-40  "  >
     <p class=" font-bold text-3xl mt-10 text-center sm:text-start">{{ cardDetail?.title}}</p>
   <div class="flex flex-col sm:flex-row pr-2 sm:pr-40 mt-6 overflow-scroll h-100 sm:h-full">
      <div class="slideshow-container  ">
        <div class=" mySlides fade" v-for="(images, i) in cardDetail?.images" >
        <img :src="images" class="w-full sm:w-2/3  slideImage rounded-lg">
        </div>
        <!-- Next and previous buttons -->
        <a class="prev" @click="plusSlides(-1)">&#10094;</a>
        <a class="next" @click="plusSlides(1)">&#10095;</a>
       
    </div>
    <div class="w-full sm:w-6/7 flex flex-col gap-10">
    <div>
    <p class=" w-full sm:w-6/7 border-2 h-10  flex justify-center items-center sizeGuideText mt-6 sm:mt-0 gap-2 font-semibold"><MeasuringTapeIcon class="w-6 h-6"/> Size Guide</p>
     <div class=" w-full sm:w-6/7 border sizeGuide  h-40 overflow-scroll ">
     <div class="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2  h-auto justify-items-center sm:justify-items-start">
        <span v-if="cardDetail?.sizes?.waist" class="flex gap-2">
            <p>Waist:</p>
            <p class="whitespace-nowrap">{{ cardDetail?.sizes?.waist }}</p>
        </span>
         <span v-if="cardDetail?.sizes?.length" class="flex gap-2 whitespace-nowrap">
            <p >Length:</p>
            <p class="whitespace-nowrap">{{ cardDetail?.sizes?.length }}</p>
        </span>
         <span v-if="cardDetail?.sizes?.shirtlength" class="flex gap-2  whitespace-nowrap">
            <p >Shirt Length:</p>
            <p class="whitespace-nowrap">{{ cardDetail?.sizes?.shirtlength }}</p>
        </span>
        <span v-if="cardDetail?.sizes?.thighWidth" class="flex gap-2 whitespace-nowrap">
            <p>Thigh Width:</p>
            <p>{{ cardDetail?.sizes?.thighWidth }}</p>
        </span>
         <span v-if="cardDetail?.sizes?.shoulder" class="flex gap-2 whitespace-nowrap">
            <p>Shoulder Length:</p>
            <p>{{ cardDetail?.sizes?.shoulder }}</p>
        </span>
          <span v-if="cardDetail?.sizes?.chest" class="flex gap-2 whitespace-nowrap">
            <p>Chest Width:</p>
            <p>{{ cardDetail?.sizes?.chest }}</p>
        </span>
      
         <span v-if="cardDetail?.sizes?.armWidth" class="flex gap-2 whitespace-nowrap">
            <p>Arm Width:</p>
            <p>{{ cardDetail?.sizes?.armWidth }}</p>
        </span>
         <span v-if="cardDetail?.sizes?.armLength" class="flex gap-2 whitespace-nowrap">
            <p>Arm Length:</p>
            <p>{{ cardDetail?.sizes?.armLength }}</p>
        </span>
     </div>

    </div>
    </div>
     <div>
    <p class=" w-full sm:w-6/7 border-2 h-10  flex justify-center items-center sizeGuideText gap-2 font-semibold"> <PaymentIcon class="w-6 h-6"/> Payment</p>
     <div class=" w-full sm:w-6/7 border sizeGuide  h-40 overflow-scroll ">
     <div class="p-4 flex flex-col justify-center items-center  gap-4">  
        <p class="text-center">Kindly reach out to us by clicking on the whatsapp icon below</p>
        <WhatsAppIcon class="w-12 h-12 cursor-pointer hover:scale-120 ease-in-out transition-all duration-500" @click="shareByWhatsApp(cardDetail?.title)"/>
     </div>
    </div>
    </div>
    </div>
   </div>
   
 </div>
 </div>
</template>

<style scoped>

.cpageHeight{
    height: 82%;

    border-color: #ffffe3;
     opacity:35%;
}
.cpContainer{
    width:100%;
    color: #C4D8E2;
}


/* Hide the images by default */
.mySlides {
  display: none;
}
.slideImage{
    height: 450px;
}

/* Slideshow container */
.slideshow-container {
 width: 100%;
  position: relative;
}


/* Next & previous buttons */
.prev, .next {
  cursor: pointer;
  position: absolute;
  top: 50%;
  width: auto;
  margin-top: -22px;
  padding: 16px;
  color: white;
  font-weight: bold;
  font-size: 18px;
  transition: 0.6s ease;
  border-radius: 0 3px 3px 0;
  user-select: none;
}

/* Position the "next button" to the right */
.next {
  right: 32%;
  border-radius: 3px 0 0 3px;
   @media screen and (max-width: 667px)  { 
       right: -3%;
    }
}
.prev{
  left: -9px;
  border-radius: 3px 0 0 3px;
}

/* On hover, add a black background color with a little bit see-through */
.prev:hover, .next:hover {
  
}
/* Fading animation */
.fade {
  animation-name: fade;
  animation-duration: 1.5s;
}

@keyframes fade {
  from {opacity: .4}
  to {opacity: 1}
}
.sizeGuide{
    border-color: #ffffe3;
    border-width: 0.5px;
     color: #C4D8E2;
    
}
.sizeGuideText{
border-color: #ffffe3;
border-width: 0.5px;
 border-bottom: 0px;
}
</style>
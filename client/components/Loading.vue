<template lang="pug">
div(
  ref='loadMain',
  :class='["loading-wrap", { "anime-end": animeEnd }, { complites: isLoad }]'
)
  .loading-text
    .text Now Loading
    .text-d .
    .text-d .
    .text-d .
  .loading-bar
    .loading-bar-front(ref='lbf')
    .loading-bar-back
  .loading-fra
    #numer.loading-numer {{ loadDone }}
    | /
    .loading-denom {{ loadNum }}
</template>

<script lang="ts">
import { Component, Ref, Watch, Vue } from 'nuxt-property-decorator'

@Component({})
export default class Loading extends Vue {
  @Ref() lbf!: HTMLDivElement
  @Ref() loadMain!: HTMLDivElement

  /** data() */
  loadNum: number = 100
  loadDone: number = 0
  isLoad: boolean = false
  animeEnd: boolean = false

  /** computed() */
  get load() {
    return this.$store.getters.load
  }

  /** watch() */
  @Watch('load')
  loadWatch(num: number) {
    this.loadDone = num
    const par = (num / this.loadNum) * 100
    this.lbf.style.clipPath = 'inset(0 0 0 ' + par + '%)'
    if (num === this.loadNum) {
      this.loadComplites()
    }
  }

  /** mounted() */
  mounted() {
    this.$store.commit('loadFlag', false)
    this.loadMain.addEventListener('animationend', () => {
      this.fadeOutEnd()
    })
  }

  /** methods() */
  loadComplites() {
    this.isLoad = true
    this.$store.commit('loadFlag', true)
  }

  fadeOutEnd() {
    this.animeEnd = true
  }
}
</script>

<style lang="stylus" scoped>
lbw = 200px
lbh = 10px

.anime-end
  display none !important

.complites
  // display none !important
  animation fadeback .1s linear 2s both

@keyframes fadeback
  from
    opacity 1
  to
    opacity 0


.loading-wrap
	width 100vw
	height 100vh
	background black
	display flex
	flex-direction column
	align-items center
	justify-content center
	gap 1ch
  position absolute

.loading-text
	color white
	& > div
		display inline-block

for i in 1..3
	.text-d:nth-of-type({i+1})
		animation load-anime 3s linear (i - 1)s infinite

@keyframes load-anime
	0%
		opacity 0
	50%
		opacity 1
	100%
		opacity 0

.loading-bar
	position relative
	.loading-bar-front
		position absolute
		width lbw
		height lbh
		background white
		border-radius lbh
		clip-path inset(0 0 0 0)
	.loading-bar-back
		width lbw
		height lbh
		background linear-gradient(to right,red,orange,yellow,green,aqua,blue,purple,red)
		border-radius lbh
		animation bg-anime 3s linear infinite

@keyframes bg-anime
	from
		background-position 0px 0px
	to
		background-position (lbw) 0px


.loading-fra
	color white
	& > div
		display inline-block
</style>

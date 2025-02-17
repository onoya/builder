import {
  BuilderBlock,
  BuilderBlocks,
  BuilderBlockComponent,
  BuilderElement,
  BuilderStoreContext,
  stringToFunction,
  BuilderAsyncRequestsContext,
  Builder
} from '@builder.io/react'
import React from 'react'
import isArray from 'lodash-es/isArray'
import last from 'lodash-es/last'

import Slider, { Settings, ResponsiveObject } from 'react-slick'

const defaultElement: BuilderElement = {
  '@type': '@builder.io/sdk:Element',
  responsiveStyles: {
    large: {
      // TODO: always apply these if not given
      position: 'relative',
      display: 'flex',
      alignItems: 'stretch',
      flexDirection: 'column',
      height: '400px'
    }
  },
  children: [
    {
      '@type': '@builder.io/sdk:Element',
      responsiveStyles: {
        large: {
          marginTop: '50px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column'
        }
      },
      component: {
        name: 'Text',
        options: {
          text: 'I am a slide'
        }
      }
    }
  ]
}
const defaultButton: BuilderElement = {
  '@type': '@builder.io/sdk:Element',
  responsiveStyles: {
    large: {
      position: 'relative',
      display: 'flex',
      alignItems: 'stretch',
      flexDirection: 'column',
      height: '30px'
    }
  }
}

type BuilderBlockType = BuilderElement

interface CarouselProps {
  slides: Array<
    React.ReactNode | { content: BuilderBlockType[] } /* BuilderBlock <- export this type */
  >
  builderBlock: BuilderBlockType
  nextButton?: BuilderBlockType[]
  prevButton?: BuilderBlockType[]
  autoplay?: boolean
  autoplaySpeed?: number
  hideDots?: boolean
  useChildrenForSlides?: boolean
  slickProps?: Settings
  responsive?: ResponsiveObject[]
}

// TODO: change to slick grid
@BuilderBlock({
  name: 'Builder:Carousel',
  // TODO: default children
  canHaveChildren: true,
  defaultStyles: {
    paddingLeft: '30px',
    paddingRight: '30px',
    paddingBottom: '30px'
  },
  inputs: [
    {
      name: 'slides',
      type: 'list',
      subFields: [
        {
          name: 'content',
          type: 'uiBlocks',
          hideFromUI: true,
          defaultValue: [defaultElement]
        }
      ],
      defaultValue: [
        {
          content: [defaultElement]
        },
        {
          content: [defaultElement]
        }
      ],
      // showIf: options => !options.get('useChildrenForSlides'),
      showIf: options => !options.get('useChildrenForSlides')
    },
    {
      name: 'hideDots',
      helperText: 'Show pagination dots',
      type: 'boolean',
      defaultValue: false
    },
    {
      name: 'autoplay',
      helperText: 'Automatically rotate to the next slide every few seconds',
      type: 'boolean',
      defaultValue: false
    },
    {
      name: 'autoplaySpeed',
      type: 'number',
      defaultValue: 5,
      helperText:
        'If auto play is on, how many seconds to wait before automatically changing each slide',
      // TODO: showIf option
      // showIf: options => options.get('autoplay'),
      // TODO: why fn not working?
      showIf: options => options.get('autoplay')
      // showIf: (options) => options.get('autoPlay')
    },
    // TODO: on add new duplicate the prior or expect use templates
    // onChange:
    {
      name: 'prevButton',
      type: 'uiBlocks',
      hideFromUI: true,
      defaultValue: [
        {
          ...defaultButton,
          component: {
            name: 'Image',
            options: {
              image:
                'https://cdn.builder.io/api/v1/image/assets%2FagZ9n5CUKRfbL9t6CaJOyVSK4Es2%2Fd909a5b91650499c9e0524cc904eeb77'
            }
          }
        }
      ]
    },
    {
      name: 'nextButton',
      type: 'uiBlocks',
      hideFromUI: true,
      defaultValue: [
        {
          ...defaultButton,
          component: {
            name: 'Image',
            options: {
              image:
                'https://cdn.builder.io/api/v1/image/assets%2FagZ9n5CUKRfbL9t6CaJOyVSK4Es2%2Fdb2a9827561249aea3817b539aacdcdc'
            }
          }
        }
      ]
    },
    {
      name: 'useChildrenForSlides',
      type: 'boolean',
      helperText:
        'Use child elements for each slide, instead of the array. Useful for dynamically repeating slides',
      advanced: true,
      defaultValue: false,
      onChange: (options: Map<string, any>) => {
        if (options.get('useChildrenForSlides') === true) {
          options.set('slides', [])
        }
      }
    },
    {
      name: 'responsive',
      type: 'array',
      helperText: 'Responsive settings - e.g. see https://kenwheeler.github.io/slick/',
      advanced: true,
      defaultValue: [
        {
          width: 3000,
          slidesToShow: 2,
          slidesToScroll: 2
        },
        {
          width: 400,
          slidesToShow: 1,
          slidesToScroll: 1
        }
      ],
      subFields: [
        {
          name: 'breakpoint',
          type: 'number',
          defaultValue: 400,
          required: true
        },
        {
          name: 'settings',
          type: 'object',
          defaultValue: {
            slidesToShow: 2,
            slidesToScroll: 2
          },
          subFields: [
            {
              name: 'slidesToShow',
              type: 'number',
              defaultValue: 2
            },
            {
              name: 'slidesToScroll',
              type: 'number',
              defaultValue: 2
            },
            {
              name: 'infinite',
              type: 'boolean',
              defaultValue: true
            },
            {
              name: 'dots',
              type: 'boolean',
              defaultValue: true
            }
          ]
        }
      ]
    }
  ]
})
export class BuilderCarousel extends React.Component<CarouselProps> {
  divRef: HTMLElement | null = null
  sliderRef: Slider | null = null

  private _errors?: Error[]
  private _logs?: string[]

  componentDidMount() {
    setTimeout(() => {
      if (this.divRef) {
        this.divRef.dispatchEvent(
          new CustomEvent('builder:carousel:load', {
            bubbles: true,
            cancelable: false,
            detail: {
              block: this.props.builderBlock,
              carousel: this.sliderRef
            }
          })
        )
      }
    })
  }

  render() {
    let slides = this.props.slides

    if (slides && !Builder.isBrowser) {
      slides = slides.slice(0, 1)
    }

    return (
      <BuilderAsyncRequestsContext.Consumer>
        {value => {
          this._errors = value && value.errors
          this._logs = value && value.logs

          return (
            <BuilderStoreContext.Consumer>
              {state => (
                <div ref={ref => (this.divRef = ref)} className="builder-carousel">
                  <style type="text/css">{slickStyles}</style>
                  <Slider
                    responsive={this.props.responsive}
                    ref={ref => (this.sliderRef = ref)}
                    afterChange={slide => {
                      // TODO; callbacks
                      if (this.divRef) {
                        this.divRef.dispatchEvent(
                          new CustomEvent('builder:carousel:change', {
                            bubbles: true,
                            cancelable: false,
                            detail: {
                              slide,
                              block: this.props.builderBlock,
                              carousel: this.sliderRef
                            }
                          })
                        )
                      }
                    }}
                    autoplay={this.props.autoplay}
                    autoplaySpeed={
                      this.props.autoplaySpeed ? this.props.autoplaySpeed * 1000 : undefined
                    }
                    dots={!this.props.hideDots}
                    // TODO: on change emit event on element?
                    // renderBottomCenterControls={this.props.hideDots ? () => null : undefined}

                    // OOF!!
                    nextArrow={
                      <div>
                        <BuilderBlocks
                          parentElementId={this.props.builderBlock.id}
                          dataPath="component.options.prevButton"
                          blocks={this.props.prevButton}
                        />
                      </div>
                    }
                    // OOF!!
                    prevArrow={
                      <div>
                        <BuilderBlocks
                          parentElementId={this.props.builderBlock.id}
                          dataPath="component.options.nextButton"
                          blocks={this.props.nextButton}
                        />
                      </div>
                    }
                    {...this.props.slickProps}
                  >
                    {/* todo: children.forEach hmm insert block inside */}
                    {this.props.useChildrenForSlides
                      ? this.props.builderBlock &&
                        this.props.builderBlock.children &&
                        this.props.builderBlock.children.map(
                          (block: BuilderElement, index: number) => {
                            if (block.repeat && block.repeat.collection) {
                              const collectionPath = block.repeat.collection
                              const collectionName = last(
                                (collectionPath || '')
                                  .split(/\.\w+\(/)[0]
                                  .trim()
                                  .split('.')
                              )
                              const itemName =
                                block.repeat.itemName ||
                                (collectionName ? collectionName + 'Item' : 'item')

                              let array: any[] | void = stringToFunction(
                                collectionPath,
                                true,
                                this._errors,
                                this._logs
                              )(state.state)

                              if (isArray(array)) {
                                if (!Builder.isBrowser) {
                                  array = array.slice(0, 1)
                                }

                                return array.map((data, index) => {
                                  // TODO: Builder state produce the data
                                  const childState = {
                                    ...state.state,
                                    $index: index,
                                    $item: data,
                                    [itemName]: data
                                  }

                                  return (
                                    <BuilderStoreContext.Provider
                                      key={block.id}
                                      value={{ ...state, state: childState } as any}
                                    >
                                      <BuilderBlockComponent
                                        block={{
                                          ...block,
                                          repeat: null
                                        }}
                                        index={index}
                                        child={true} /* TODO: fieldname? */
                                      />
                                    </BuilderStoreContext.Provider>
                                  )
                                })
                              }
                            }
                            return (
                              <BuilderBlockComponent
                                key={block.id}
                                block={block}
                                index={index}
                                child={true} /* TODO: fieldname? */
                              />
                            )
                          }
                        )
                      : this.props.slides &&
                        this.props.slides.map((slide, index) => (
                          // TODO: how make react compatible with plain react components
                          // slides: <Foo><Bar> <- builder blocks if passed react nodes as blocks just forward them
                          <BuilderBlocks
                            key={index}
                            parentElementId={this.props.builderBlock && this.props.builderBlock.id}
                            dataPath={`component.options.slides.${index}.content`}
                            child
                            blocks={(slide as any).content || slide}
                          />
                        ))}
                  </Slider>
                </div>
              )}
            </BuilderStoreContext.Consumer>
          )
        }}
      </BuilderAsyncRequestsContext.Consumer>
    )
  }
}

const slickStyles = `@charset 'UTF-8';
  .slick-list,.slick-slider,.slick-track{position:relative;display:block}.slick-loading .slick-slide,.slick-loading .slick-track{visibility:hidden}.slick-slider{box-sizing:border-box;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;-webkit-touch-callout:none;-khtml-user-select:none;-ms-touch-action:pan-y;touch-action:pan-y;-webkit-tap-highlight-color:transparent}.slick-list{overflow:hidden;margin:0;padding:0}.slick-list:focus{outline:0}.slick-list.dragging{cursor:pointer;cursor:hand}.slick-slider .slick-list,.slick-slider .slick-track{-webkit-transform:translate3d(0,0,0);-moz-transform:translate3d(0,0,0);-ms-transform:translate3d(0,0,0);-o-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}.slick-track{top:0;left:0}.slick-track:after,.slick-track:before{display:table;content:''}.slick-track:after{clear:both}.slick-slide{display:none;float:left;height:auto;min-height:1px}[dir=rtl] .slick-slide{float:right}.slick-slide img{display:block}.slick-slide.slick-loading img{display:none}.slick-slide.dragging img{pointer-events:none}.slick-initialized .slick-slide{display:block}.slick-vertical .slick-slide{display:block;height:auto;border:1px solid transparent}.slick-arrow.slick-hidden{display:none}
  .slick-dots,.slick-next,.slick-prev{position:absolute;display:block;padding:0}.slick-dots li button:before,.slick-next:before,.slick-prev:before{font-family:slick;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.slick-loading .slick-list{background:url(ajax-loader.gif) center center no-repeat #fff}@font-face{font-family:slick;font-weight:400;font-style:normal;src:url('https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/fonts/slick.eot');src:url('https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/fonts/slick.eot?#iefix') format('embedded-opentype'),url('https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/fonts/slick.woff') format('woff'),url('https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/fonts/slick.ttf') format('truetype'),url('https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/fonts/slick.svg#slick') format('svg')}.slick-next,.slick-prev{font-size:0;line-height:0;top:50%;width:20px;height:20px;-webkit-transform:translate(0,-50%);-ms-transform:translate(0,-50%);transform:translate(0,-50%);cursor:pointer;color:transparent;border:none;outline:0;background:0 0}.slick-next:focus,.slick-next:hover,.slick-prev:focus,.slick-prev:hover{color:transparent;outline:0;background:0 0}.slick-next:focus:before,.slick-next:hover:before,.slick-prev:focus:before,.slick-prev:hover:before{opacity:1}.slick-next.slick-disabled:before,.slick-prev.slick-disabled:before{opacity:.25}.slick-next:before,.slick-prev:before{font-size:20px;line-height:1;opacity:.75;color:#fff}.slick-prev{left:-25px}[dir=rtl] .slick-prev{right:-25px;left:auto}.slick-prev:before{content:''}.slick-next:before,[dir=rtl] .slick-prev:before{content:''}.slick-next{right:-25px}[dir=rtl] .slick-next{right:auto;left:-25px}[dir=rtl] .slick-next:before{content:'•'}.slick-dotted.slick-slider{margin-bottom:30px}.slick-dots{bottom:-25px;width:100%;margin:0;list-style:none;text-align:center}.slick-dots li{position:relative;display:inline-block;width:20px;height:20px;margin:0 5px;padding:0;cursor:pointer}.slick-dots li button{font-size:0;line-height:0;display:block;width:20px;height:20px;padding:5px;cursor:pointer;color:transparent;border:0;outline:0;background:0 0}.slick-dots li button:focus,.slick-dots li button:hover{outline:0}.slick-dots li button:focus:before,.slick-dots li button:hover:before{opacity:1}.slick-dots li button:before{font-size:6px;line-height:20px;position:absolute;top:0;left:0;width:20px;height:20px;content:'•';text-align:center;opacity:.25;color:#000}.slick-dots li.slick-active button:before{opacity:.75;color:#000}
`

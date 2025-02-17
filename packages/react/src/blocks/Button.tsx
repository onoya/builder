import React from 'react'
import { BuilderBlock } from '../decorators/builder-block.decorator'

export interface ButtonProps {
  attributes?: any
  text?: string
  link?: string
  openLinkInNewTab?: boolean
}

@BuilderBlock({
  name: 'Core:Button',
  image:
    'https://cdn.builder.io/api/v1/image/assets%2FIsxPKMo2gPRRKeakUztj1D6uqed2%2F81a15681c3e74df09677dfc57a615b13',
  defaultStyles: {
    // TODO: make min width more intuitive and set one
    appearance: 'none',
    paddingTop: '15px',
    paddingBottom: '15px',
    paddingLeft: '25px',
    paddingRight: '25px',
    backgroundColor: '#3898EC',
    color: 'white',
    borderRadius: '4px',
    textAlign: 'center',
    cursor: 'pointer'
  },
  inputs: [
    {
      name: 'text',
      type: 'text',
      defaultValue: 'Click me!'
    },
    {
      // TODO: custom link form editor to link to other pages, scroll to
      // etc
      name: 'link',
      type: 'url'
    },
    {
      // TODO: custom link form editor to link to other pages, scroll to
      // etc
      name: 'openLinkInNewTab',
      type: 'boolean',
      defaultValue: false,
      friendlyName: 'Open link in new tab'
    }
  ],
  static: true,
  noWrap: true
  // TODO: defaultChildren
  // canHaveChildren: true,
})
export class Button extends React.Component<ButtonProps> {
  render() {
    const Tag = this.props.link ? 'a' : 'span'
    return (
      <Tag
        href={this.props.link}
        target={this.props.openLinkInNewTab ? '_blank' : undefined}
        {...this.props.attributes}
      >
        {this.props.text}
      </Tag>
    )
  }
}

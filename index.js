import React, { Component } from 'react'
import { View, Animated } from 'react-native'

export default class ProgressCircle extends Component {
  static defaultProps = {
    value: 0,
    size: 64,
    thickness: 7,
    color: '#4c90ff',
    unfilledColor: 'transparent',
    style: {},
    children: null,
    animationMethod: null,
    animationConfig: { duration: 200 },
    shouldAnimateFirstValue: false,
    onChange() {},
    onChangeAnimationEnd() {},
  }

  constructor(props) {
    super(props)
    this.state = {
      animatedValue:
        props.value.constructor.name === 'AnimatedValue'
          ? null
          : new Animated.Value(props.shouldAnimateFirstValue ? 0 : props.value),
    }
  }

  componentWillReceiveProps({ value }) {
    this.handleChange(value)
  }

  render() {
    const { thickness, unfilledColor, children, style } = this.props

    return (
      <View style={[{ flexDirection: 'row' }, this.fullCircleStyle, style]}>
        <View
          pointerEvents="box-none"
          style={{
            ...this.fullCircleStyle,
            borderWidth: thickness,
            borderColor: unfilledColor,
            position: 'absolute',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {children}
        </View>
        {this.renderHalfCircle()}
        {this.renderHalfCircle({ isFlipped: true })}
      </View>
    )
  }

  get fullCircleStyle() {
    return {
      width: this.props.size,
      height: this.props.size,
      borderRadius: this.props.size / 2,
    }
  }

  get halfCircleContainerStyle() {
    return {
      width: this.props.size / 2,
      height: this.props.size,
      overflow: 'hidden',
    }
  }

  ANIMATION_TYPES = ['timing', 'spring', 'bounce', 'decay']
  get animationMethod() {
    return this.ANIMATION_TYPES.includes(this.props.animationMethod)
      ? this.props.animationMethod
      : null
  }

  handleChange = (value = this.props.value) => {
    this.props.onChange()
    if (value.constructor.name === 'AnimatedValue') {
      return
    }

    if (this.animationMethod) {
      this.animateChange(value)
    } else {
      this.state.animatedValue.setValue(value)
    }
  }

  animateChange = value =>
    Animated[this.animationMethod](this.state.animatedValue, {
      toValue: value,
      useNativeDriver: true,
      ...this.props.animationConfig,
    }).start(this.props.onChangeAnimationEnd)

  renderHalfCircle = ({ isFlipped = false } = {}) => {
    const { size, color, thickness, value } = this.props
    const valueToInterpolate =
      value.constructor.name === 'AnimatedValue'
        ? value
        : this.state.animatedValue

    return (
      <View
        pointerEvents="none"
        style={{
          ...this.halfCircleContainerStyle,
          transform: [{ scaleX: isFlipped ? -1 : 1 }],
        }}
      >
        <Animated.View
          style={{
            ...this.fullCircleStyle,
            paddingLeft: size / 2,
            flexDirection: 'row',
            overflow: 'hidden',
            transform: [
              {
                rotate: valueToInterpolate.interpolate({
                  inputRange: isFlipped ? [0, 0.5] : [0.5, 1],
                  outputRange: isFlipped
                    ? ['360deg', '180deg']
                    : ['0deg', '180deg'],
                  extrapolate: 'clamp',
                }),
              },
            ],
          }}
        >
          <View style={this.halfCircleContainerStyle}>
            <View
              style={{
                ...this.fullCircleStyle,
                borderWidth: thickness,
                borderColor: color,
                transform: [{ translateX: -size / 2 }],
              }}
            />
          </View>
        </Animated.View>
      </View>
    )
  }
}

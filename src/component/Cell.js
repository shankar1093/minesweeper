import React from 'react'
import PropTypes from 'prop-types'

export default class Cell extends React.Component {
    state = {
        isHover: false,
    }
    handleMouseHover = this.handleMouseHover.bind(this);
    // Returns value in cell (empty, flag or mine)
    getValue() {
        const { value } = this.props;

        if (!value.isRevealed) {
            return this.props.value.isFlagged ? "🚩" : null;            
        } else if (value.isMine) {
            return "💣";
        } else if (value.neighbour === 0) {
            return null;
        }
        return value.neighbour;
    }

    //reveals mine
    revealMine() {
        const { value } = this.props;

        if (this.state.isHover) {
            if (this.props.cheatCode && value.isMine) {
                return "💣";
            } 
        }
    }

    //functions toggling hover state
    handleMouseHover() {
        this.setState(this.toggleHoverState)
    }

    toggleHoverState(state) {
        return { isHover: !state.isHover,};
    }

    render() {
        const { value, onClick, cMenu } = this.props;
        let className = "cell" + (value.isRevealed ? "" : " hidden") + (value.isMine ? " is-mine" : "") + (value.isFlagged ? " is-flag" : "");

        return (
            <div
                onClick={onClick}
                className={className}
                onContextMenu={cMenu}
                onMouseEnter={this.handleMouseHover}
                onMouseLeave={this.handleMouseHover}
            >
                {this.getValue()}
                {this.revealMine()}
            </div>
        );
    }
}

const cellItemShape = {
    isRevealed: PropTypes.bool,
    isFlagged: PropTypes.bool,
    isMine: PropTypes.bool,
    isHover: PropTypes.bool,
}

Cell.propTypes = {
    value: PropTypes.objectOf(PropTypes.shape(cellItemShape)),
    onClick: PropTypes.func,
    cMenu: PropTypes.func
}
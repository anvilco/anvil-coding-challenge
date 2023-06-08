import React from 'react'
import PropTypes from 'prop-types'
import Input from "components/Input"
import Content from "components/Content"
import styled from "styled-components"

const StyledSearchContentCard = styled(Content.Card)`
  padding: 10px;
`
const StyledSearchInput = styled(Input)`
  width: 100%;
  border: 0;
`

class SearchInput extends React.Component {
    render () {
        return (
            <StyledSearchContentCard>
                <StyledSearchInput
                    value={this.props.value}
                    placeholder="Search by keyword"
                    onChange={this.props.onChange} />
            </StyledSearchContentCard>
        )
    }
}

SearchInput.defaultProps = {
}

SearchInput.propTypes = {
    onChange: PropTypes.func,
    value: PropTypes.string,
}

export default SearchInput
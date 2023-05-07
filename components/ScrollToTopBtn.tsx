import * as React from 'react';
import Fab from '@mui/material/Fab';
import UpIcon from '@mui/icons-material/KeyboardArrowUp';
import {SxProps, Zoom} from "@mui/material";


export default class ScrollToTopBtn extends React.Component<any, any> {
    scrollToTop = () => {
        window.scrollTo({top: 0, left: 0, behavior: 'smooth'})
    }
    state = {scrollingToTop: false}
    lastScrollY = 0
    scrollEvent = () => {
        if (window.scrollY - this.lastScrollY > 0 || window.scrollY < 50) {
            this.lastScrollY = window.scrollY
            this.setState({scrollingToTop: false})
        } else if (window.scrollY - this.lastScrollY < -50 && window.scrollY > 100) {
            this.lastScrollY = window.scrollY
            this.setState({scrollingToTop: true})
        }
    }

    shouldComponentUpdate(nextProps: Readonly<any>, nextState: Readonly<any>, nextContext: any): boolean {
        return this.state.scrollingToTop !== nextState.scrollingToTop
    }

    componentDidMount() {
        addEventListener('scroll', this.scrollEvent);
    }

    componentWillUnmount() {
        removeEventListener('scroll', this.scrollEvent)
    }

    render() {
        const fabStyle = {
            position: 'fixed',
            bottom: 16,
            right: 16,
        } as SxProps;
        return (
            <Zoom in={this.state.scrollingToTop}>
                <Fab
                    color="secondary"
                    sx={fabStyle}
                    onClick={this.scrollToTop}
                    aria-label="scroll back to top">
                    <UpIcon/>
                    {this.props.children}
                </Fab>
            </Zoom>
        );
    }
}

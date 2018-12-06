import {
  Collapse, DropdownItem, DropdownMenu,
  DropdownToggle,
  Nav,
  Navbar,
  NavItem,
  NavbarToggler,
  NavLink as ReactstrapNavLink,
  UncontrolledDropdown,
} from "reactstrap";
import { Link } from "gatsby";
import * as React from "react";
import Icon from "../../assets/logo.svg";
import styled from "styled-components";
import { widths } from "../styles/variables";
import { FaHome, FaRss, FaMale, FaGlobe, FaFile, FaInfo } from "react-icons/fa";

interface Props {
  title: string;
  location: Location;
}

interface State {
  isOpen: boolean;
}

function NavLink(props: { to: string, children: React.ReactNode }) {
  return (
    <Link to={props.to} className="nav-link">
      {props.children}
    </Link>
  );
}

const StyledLogo = styled(Icon)`
  width: 42px;
  height: 42px;
  margin-right: 8px;
`;

function Branding(props: { title: string }) {
  return (
    <Link to={"/"} className={"navbar-brand"}>
      <StyledLogo/>
      {props.title}
    </Link>
  );
}

const NavbarDiv = styled.div`
  background-color: #303030;

  & > *{
    max-width: ${widths.xl}px;
    margin-left: auto;
    margin-right: auto;
  }
`;

function atHomePage(pathname: string) {
  return pathname === "/" || pathname.match(/\/\d+/) !== null;
}

export default class Header extends React.PureComponent<Props, State> {

  state = {
    isOpen: false,
  };

  toggle = () => {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  }

  render() {
    const { pathname } = this.props.location;
    return (
      <NavbarDiv>
        <Navbar color="light" light={true} expand="md">
          <Branding title={this.props.title}/>
          <NavbarToggler onClick={this.toggle}/>
          <Collapse isOpen={this.state.isOpen} navbar={true}>
            <Nav className="ml-auto" navbar={true}>
              <NavItem active={atHomePage(pathname)}>
                <NavLink to="/"><FaHome/>Home</NavLink>
              </NavItem>
              <NavItem active={pathname.startsWith("/resume")}>
                <NavLink to="/resume"><FaFile/>Resume</NavLink>
              </NavItem>
                <UncontrolledDropdown nav={true} inNavbar={true}>
                  <DropdownToggle nav={true}
                                  caret={true}
                                  className={pathname.startsWith("/about/") ? "active" : undefined} >
                    <FaInfo/> About
                  </DropdownToggle>
                  <DropdownMenu right={true}>
                    <DropdownItem active={pathname.startsWith("/about/project")}>
                      <NavLink to="/about/project"><FaGlobe/>About Website</NavLink>
                    </DropdownItem>
                    <DropdownItem active={pathname.startsWith("/about/me")}>
                      <NavLink to="/about/me"><FaMale/>About Me</NavLink>
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              <NavItem>
                <ReactstrapNavLink href="/rss.xml">
                  <FaRss/> RSS
                </ReactstrapNavLink>
              </NavItem>
            </Nav>
          </Collapse>
        </Navbar>
      </NavbarDiv>
    );
  }

}

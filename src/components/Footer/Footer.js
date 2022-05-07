import { BsGithub } from "react-icons/bs";

export function Footer() {
  return(
    <div className="footer">
       <a href="https://github.com/gl-cardillo" target="_blank" rel="noreferrer">
        <BsGithub />
      </a>
      <p>Made by Luca Cardillo</p>
    </div>
  )
}
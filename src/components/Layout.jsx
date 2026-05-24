import WcCountdownBar from './WcCountdownBar.jsx'
import Header from './Header.jsx'
import Footer from './Footer.jsx'

export default function Layout({ children, withWcBar = false }) {
  return (
    <>
      {withWcBar && <WcCountdownBar />}
      <Header withWcBar={withWcBar} />
      {children}
      <Footer />
    </>
  )
}

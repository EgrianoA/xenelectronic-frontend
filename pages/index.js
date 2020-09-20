import { useState, useEffect } from 'react';
import { Row, Col, Form, Drawer, Card, Checkbox, Modal, Icon } from 'antd';
import axios from 'axios';
import openNotification from '../components/_shared/open-notification'
import headers from '../components/_shared/headers';
import Router from 'next/router';
import moment from 'moment'
import FormLogin from '../components/loginForm'
import convertToRp from '../helpers/convertToRp'

const Home = () => {
  const [loginModalVisible, setLoginModalVisible] = useState(false)
  const [userLoggedIn, setUserLoggedIn] = useState(false)
  const [totalCart, setTotalCart] = useState(0)
  const [visible, setVisible] = useState(false)
  const [productDetail, setProductDetail] = useState()
  const [openDrawer, setOpenDrawer] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState([])
  const [productCategoryList, setProductCategoryList] = useState([])
  const [productList, setProductList] = useState([])
  const WrappedLogin = Form.create({ name: 'login' })(FormLogin)

  useEffect(() => {
    checkLoginStatus()
    fetchProductCategory()
    fetchProduct()
    fetchCart()
  }, []);

  const checkLoginStatus = () => {
    if (localStorage.getItem('token')) {
      setUserLoggedIn(true)
    }
  }

  const fetchProductCategory = () => {
    axios
      .get(process.env.API + `/productCategory/view`)
      .then(res => {
        let productCategoryValue = res.data.data;
        setProductCategoryList(productCategoryValue)
      })
      .catch(err => {
        console.log(err)
      });
  };

  const fetchProduct = (category) => {
    const query = {}
    query.category = category ? category : []
    axios
      .post(process.env.API + `/product/view`, query)
      .then(res => {
        let productValue = res.data.data;
        setProductList(productValue)
      })
      .catch(err => {
        console.log(err)
      });
  };

  const fetchCart = () => {
    if (userLoggedIn) {
      axios
        .get(process.env.API + `/order/viewMyCart`, headers(localStorage.getItem('token')))
        .then(res => {
          if (res.data.statusCode === 200) {
            setTotalCart(res.data.data.products.length)
          } else {
            console.log(res.data)
          }
        })
        .catch(err => {
          console.log(err)
        });
    }
  }


  const drawerToggle = () => {
    setOpenDrawer(!openDrawer)
  }
  const onClose = () => {
    setOpenDrawer(false)
  }

  const addFilter = (e, item) => {
    let arrFilter = selectedCategory
    if (e.target.checked) {
      arrFilter.push(item._id)
      setSelectedCategory(arrFilter)
      fetchProduct(arrFilter)
    } else {
      const getIdx = arrFilter.findIndex(category => category === item._id)
      if (getIdx > -1) {
        arrFilter.splice(getIdx, 1)
        setSelectedCategory(arrFilter)
        fetchProduct(arrFilter)
      }
    }
  }

  const openModal = item => {
    setVisible(true)
    setProductDetail(item)
  }

  const login = () => {
    setLoginModalVisible(!loginModalVisible)
  }

  const logout = () => {
    openNotification('success', 'Anda berhasil logout', 'Sampai Jumpa!')
    localStorage.clear();
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }

  const addToCart = (products) => {
    const query = {
      products: {
        qty: 1,
        products: products._id
      }
    }
    axios
      .post(process.env.API + `/order/addToCart`, query, headers(localStorage.getItem('token')))
      .then(res => {
        if (res.data.statusCode === 200) {
          openNotification('success', 'Berhasil menambahkan ' + products.name + ' kedalam keranjang!', '')
        } else {
          openNotification('error', 'Gagal menambahkan ' + products.name + ' kedalam keranjang', res.data.message)
        }

      })
      .catch(err => {
        console.log(err)
        openNotification('error', 'Gagal menambahkan ' + products.name + ' kedalam keranjang', '')
      });

  }



  return (
    <div className="homePage">
      <div className="header">
        <Row>
          <Col xs={8} md={3}>
            <div className="menu">
              <Icon type="filter" onClick={drawerToggle} className="menuButton" />
            </div>
          </Col>
          <Col xs={8} md={17}>
            <div align="center">
              <h1>XE</h1>
              <p>XenElectronics</p>
            </div>
          </Col>
          <Col xs={8} md={4}>
            <div className="rightIcons">
              {userLoggedIn && (
                <div>
                  <Icon type="shopping-cart" onClick={() => Router.push('/myOrder')} className="shoppingCartButton" />
                  <Icon type="logout" onClick={logout} className="logoutButton" />
                </div>
              )}
              {!userLoggedIn && (
                <Icon type="login" onClick={login} className="loginButton" />
              )}
            </div>
          </Col>
        </Row>
        <hr className='headDivider' />
        <Drawer
          placement={'left'}
          visible={openDrawer}
          onClose={onClose}
          className="drawer">
          <h3>Filter</h3>
          {productCategoryList && productCategoryList.length > 1 && (
            productCategoryList.map((productCategory) => {
              return (
                <div>
                  <Checkbox onChange={() => addFilter(event, productCategory)}>{productCategory.name}</Checkbox>
                </div>
              )
            }))}
        </Drawer>
      </div>
      <Modal
        footer={null}
        visible={loginModalVisible}
        onCancel={() => setLoginModalVisible(false)}
      >
        <Row type="flex" justify="space-around" align="middle" style={{ marginTop: '10vh' }}>
          <Col>
            <WrappedLogin />
          </Col>
        </Row>
      </Modal>
      <Row>
        <div className='page'>
          {userLoggedIn && (
            <p className='userName'>Hi, {localStorage.getItem('username')}</p>
          )}
          <Row gutter={16} className='container'>
            {productList && productList.length > 1 && (
              productList.map((product) => {
                return (
                  <center>
                    <Modal
                      className="modal"
                      footer={null}
                      visible={visible}
                      onCancel={() => setVisible(false)}
                    >
                      {productDetail && (
                        <div className="productDetail">
                          <Col xs={24} lg={12} className="leftSection">
                            <center>
                              <img src={productDetail.image} />
                            </center>
                          </Col>
                          <Col xs={24} lg={12} className="rightSection">
                            <center>
                              <h3>{productDetail.name}</h3>
                              <h4>{convertToRp(parseInt(productDetail.price))}</h4>
                            </center>
                            <p>{productDetail.desc}</p>
                            <center>
                              <button className="addToCartButton" onClick={() => addToCart(productDetail)}><a><span> Add To Cart</span><Icon type='shopping-cart' /></a></button>
                            </center>
                          </Col>
                        </div>
                      )}
                    </Modal>
                    <Col xs={12} lg={8} xl={6} className='item' style={{ marginBottom: '20px' }}>
                      <Card className='itemCard'>
                        <a><Row onClick={() => openModal(product)}>
                          <Row>
                            <img src={product.image} className='itemImage' />
                          </Row>
                          <br />
                          <div style={{ textAlign: 'left' }}>
                            <h3>{product.name}</h3>
                            <p>{convertToRp(parseInt(product.price))}</p>
                            <br />
                          </div>
                        </Row>
                        </a>
                        <Row className="cardFooter">
                          {userLoggedIn && (
                            <a>
                              <div className="cart">
                                <img src="/assets/Icon awesome-cart-plus.png" onClick={() => addToCart(product)} />
                              </div>
                            </a>
                          )}
                        </Row>
                      </Card>
                    </Col>
                  </center>
                )
              })
            )}
          </Row>
        </div>
      </Row>
    </div >
  );
};
export default Home;

import { useState, useEffect } from "react";
import { Carousel, Container, Card, Row, Col, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard/ProductCard";
import moment from "moment";
import "./Home.style.css";
import api from "../api";

const Home = () => {
	const [homeData, setHomeData] = useState({
		inSlider: [],
		isHot: [],
		posts: [],
	});
	const [isLoading, setLoading] = useState(true);
	const navigate = useNavigate();

	const fetchHomeData = async () => {
		try {
			const responses = await Promise.all([
				api.get("/api/product/inSlider"),
				api.get("/api/product/isHot"),
				api.get("/api/post?page=1&perPage=3"),
			]);

			if (responses.length) {
				setHomeData({
					inSlider: responses[0].data.products,
					isHot: responses[1].data.products,
					posts: responses[2].data.docs,
				});
				setLoading(false);
			}
		} catch (err) {
			console.log(err);
		}
	};

	useEffect(() => {
		fetchHomeData();
	}, []);

	const handleClickTag = (tag) => {
		navigate(`products?tag=${tag}`);
	};

	const handleClickNews = (id) => {
		navigate(`news/${id}`);
	};

	return (
		<>
			{/* Carousel section */}
			<section>
				<Carousel fade>
					{isLoading ? (
						<Carousel.Item>
							<Spinner animation="border" role="status" />
						</Carousel.Item>
					) : (
						homeData.inSlider.map((item) => (
							<Carousel.Item key={item._id} interval={3000}>
								<img
									className="d-block w-100 h-auto my-0 mx-auto"
									src={item.avatar}
									alt={item.name}
								/>
							</Carousel.Item>
						))
					)}
				</Carousel>
			</section>

			{/* Hot Product section */}
			<section className="hot-section mt-4">
				<Container>
					<div className="text-center">
						<h2>Hot Products</h2>
					</div>
					<Row>
						{isLoading ? (
							<div className="text-center py-5">
								<Spinner animation="border" role="status" />
							</div>
						) : (
							homeData.isHot.map((item) => (
								<ProductCard
									key={item._id}
									data={item}
									onClickTag={handleClickTag}
								/>
							))
						)}
					</Row>
				</Container>
			</section>

			{/* News section */}
			<section className="news-section mt-4 py-4">
				<div className="text-center">
					<h2>News</h2>
				</div>

				{isLoading ? (
					<div className="text-center py-5">
						<Spinner animation="border" role="status" />
					</div>
				) : (
					<Container>
						<Row>
							{homeData.posts.map((item) => {
								return (
									<Col
										xs={12}
										md={6}
										lg={4}
										className="p-4"
										key={homeData.posts.indexOf(item)}
									>
										<Card
											className="shadow h-100 news-card"
											onClick={() => {
												handleClickNews(item._id);
											}}
										>
											<Card.Img variant="top" src={item.avatar} />
											<Card.Body className="px-4 py-3">
												<Card.Title>{item.title}</Card.Title>
											</Card.Body>
											<span className="px-4 pb-3">
												{moment(item.createdAt).format("DD/MM/YYYY")}
											</span>
										</Card>
									</Col>
								);
							})}
						</Row>
						<div className="text-center">
							<Link to="news">See more</Link>
						</div>
					</Container>
				)}
			</section>
		</>
	);
};

export default Home;

import { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet";
import {
	Container,
	Row,
	Col,
	Form,
	FormControl,
	Pagination,
	Card,
	Placeholder,
	InputGroup,
	Button,
} from "react-bootstrap";
import { useSearchParams, useLocation } from "react-router-dom";
import { debounce } from "debounce";

import api from "../api";
import placeholderImg from "../components/ProductCard/placeholder-image.png";
import ProductCard from "../components/ProductCard/ProductCard";
import "./Product.style.css";

const PriceFilter = ({ min, max, handleSubmit }) => {
	const [minInput, setMinInput] = useState(0);
	const [maxInput, setMaxInput] = useState(0);

	const handleRangeInput = (e) => {
		if (e.target.id === "min") {
			setMinInput(e.target.value);
			return;
		}
		setMaxInput(e.target.value);
	};

	return (
		<div className="slider-section">
			<div className="tag-section-header mb-2 text-center">Price range</div>
			<Form
				onSubmit={(e) => {
					e.preventDefault();
					handleSubmit(minInput, maxInput);
				}}
			>
				<Row className="d-flex flex-column align-items-center">
					<Col xs={6} md={10} lg={8}>
						<InputGroup size="sm">
							<InputGroup.Text>$</InputGroup.Text>
							<FormControl
								id="min"
								type="number"
								className="text-center"
								placeholder={min}
								min={min}
								max={max - 1}
								onChange={handleRangeInput}
							/>
						</InputGroup>
					</Col>
					<span className="text-center">-</span>
					<Col xs={6} md={10} lg={8}>
						<InputGroup size="sm">
							<InputGroup.Text>$</InputGroup.Text>
							<FormControl
								id="max"
								type="number"
								className="text-center"
								placeholder={max}
								min={min}
								max={max - 1}
								onChange={handleRangeInput}
							/>
						</InputGroup>
					</Col>
					<Col className="d-flex justify-content-center">
						<Button type="submit" size="sm" className="mt-2">
							Filter
						</Button>
					</Col>
				</Row>
			</Form>
		</div>
	);
};

const Products = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [products, setProducts] = useState([]);
	const [searchParams, setSearchParams] = useSearchParams();
	const [searchTerm, setTerm] = useState(searchParams.get("name"));
	const [totalPage, setTotalPage] = useState(0);
	const [currentPage, setCurrentPage] = useState(searchParams.get("page") || 1);
	const pageSize = 10;
	const searchInputRef = useRef(null);

	const location = useLocation();

	const fetchProducts = async () => {
		setIsLoading(true);
		const page = searchParams.get("page");
		const search = searchParams.get("name");
		const min = searchParams.get("min");
		const max = searchParams.get("max");

		searchInputRef.current.value = search;

		if (!page) {
			setCurrentPage(1);
		}

		const url = `/api/product?${search ? `name=${search}&` : ""}page=${
			page ? page : 1
		}&perPage=${pageSize}${
			min && max ? `&minPrice=${min}&maxPrice=${max}` : ""
		}`;

		try {
			const res = await api.get(url);

			if (res.status === 200) {
				setProducts(res.data.docs);
				setTotalPage((res.data.totalDocs + pageSize - 1) / pageSize);
				setIsLoading(false);
			}
		} catch (err) {
			console.log(err);
		}
	};

	useEffect(() => {
		fetchProducts();
		// eslint-disable-next-line
	}, [location]);

	const handlePageChange = (number) => {
		if (searchTerm) {
			setSearchParams({ name: searchTerm, page: number });
		} else {
			searchParams.set("page", number);
			setSearchParams(searchParams);
		}
		setCurrentPage(number);
	};

	const handleSearchInput = (e) => {
		setCurrentPage(1);
		setTerm(e.target.value);

		if (!e.target.value) {
			setSearchParams({ page: 1 });
			return;
		}

		setSearchParams({ name: e.target.value, min: 0, max: 30000 });
	};

	const handlePriceFilter = (min, max) => {
		if (!min && !max) {
			setSearchParams({ page: 1 });
			return;
		}

		setCurrentPage(1);
		setSearchParams({ min, max });
	};

	const handleClickTag = (tag) => {
		// To be changed
		console.log("clicked", tag);
		setCurrentPage(1);
		setSearchParams({ filter: tag });
	};

	const PaginationComp = ({ total, current }) => {
		let items = [];
		for (let number = 1; number <= total; number++) {
			items.push(
				<Pagination.Item
					key={number}
					// eslint-disable-next-line
					active={number == current}
					onClick={() => {
						handlePageChange(number);
					}}
				>
					{number}
				</Pagination.Item>
			);
		}

		return <Pagination>{items}</Pagination>;
	};

	const PlaceholderCard = () => (
		<Col xs={12} lg={6} className="p-4">
			<Card>
				<Card.Img variant="top" src={placeholderImg} />
				<Card.Body>
					<Placeholder as={Card.Title} animation="glow">
						<Placeholder xs={6} />
					</Placeholder>
					<hr />
					<Placeholder as={Card.Text} animation="glow">
						<Placeholder xs={7} /> <Placeholder xs={4} />
						<Placeholder xs={8} />
					</Placeholder>
					<Row>
						<Col>
							<Placeholder animation="glow">
								<Placeholder xs={6} />
							</Placeholder>
						</Col>
						<Col className="d-flex justify-content-end">
							<Placeholder.Button variant="warning" xs={6} />
						</Col>
					</Row>
				</Card.Body>
			</Card>
		</Col>
	);

	const ProductList = ({ items, onClickTag }) => {
		if (!items.length) {
			return (
				<Container>
					<h3 className="text-center my-3">No Products...</h3>
				</Container>
			);
		}

		return items.map((item) => (
			<ProductCard key={item._id} data={item} onClickTag={onClickTag} />
		));
	};

	return (
		<>
			<Helmet>
				<title>Voucher Shop - Products</title>
			</Helmet>
			<Container className="product-content d-flex mt-4">
				{/* Side nav */}
				<div className="product-side-nav">
					<PriceFilter min={0} max={30000} handleSubmit={handlePriceFilter} />
				</div>
				{/* Products section */}
				<div className="product-main">
					<div className="w-100 px-3">
						<FormControl
							ref={searchInputRef}
							type="search"
							placeholder="Search"
							aria-label="Search"
							onChange={debounce(handleSearchInput, 1000)}
						/>
					</div>
					<Row className="product-list">
						{isLoading ? (
							<>
								<PlaceholderCard />
								<PlaceholderCard />
							</>
						) : (
							<ProductList items={products} onClickTag={handleClickTag} />
						)}
					</Row>
					{/* Pagination */}
					{products.length ? (
						<div className="d-flex justify-content-center">
							<PaginationComp total={totalPage} current={currentPage} />
						</div>
					) : (
						<></>
					)}
				</div>
			</Container>
		</>
	);
};

export default Products;

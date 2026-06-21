import { Link } from "react-router-dom";
import { Store } from "lucide-react";
import { useState } from "react";
import { Button, EmptyState } from "@sdkwork/ui-pc-react";
import {
  readMallFavorites,
  readMallShopFavorites,
  removeMallFavorite,
  toggleMallShopFavorite,
} from "../favorites-service";

export function SdkworkMallFavoritesPage() {
  const [productItems, setProductItems] = useState(readMallFavorites());
  const [shopItems, setShopItems] = useState(readMallShopFavorites());

  return (
    <div>
      <h1>我的收藏</h1>
      <section>
        <h2>商品收藏</h2>
        {productItems.length === 0 ? (
          <EmptyState description="浏览商品时可加入收藏" title="暂无商品收藏" />
        ) : (
          <ul className="sdkwork-mall-pc-footprint-list">
            {productItems.map((item) => (
              <li key={item.id}>
                <Link to={`/product/${item.id}`}>{item.title}</Link>
                <Button
                  onClick={() => {
                    removeMallFavorite(item.id);
                    setProductItems(readMallFavorites());
                  }}
                  type="button"
                >
                  取消收藏
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2><Store aria-hidden="true" size={16} /> 关注店铺</h2>
        {shopItems.length === 0 ? (
          <EmptyState description="在店铺页可点击关注" title="暂无关注店铺" />
        ) : (
          <ul className="sdkwork-mall-pc-footprint-list">
            {shopItems.map((item) => (
              <li key={item.id}>
                <Link to={`/shop/${item.id}`}>{item.name}</Link>
                <Button
                  onClick={() => {
                    toggleMallShopFavorite(item);
                    setShopItems(readMallShopFavorites());
                  }}
                  type="button"
                >
                  取消关注
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <p>收藏与关注数据暂存于本机浏览器，服务端同步需等待 commerce favorites API 合约落地。</p>
    </div>
  );
}

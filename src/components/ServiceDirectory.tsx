"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  publicServices,
  serviceCategories,
  type ServiceVehicle,
} from "@/data/public-services";

type DirectoryFilter = "all" | "business" | ServiceVehicle;

const filters: Array<{ value: DirectoryFilter; label: string }> = [
  { value: "all", label: "Tất cả dịch vụ" },
  { value: "car", label: "Ô tô" },
  { value: "motorbike", label: "Xe máy" },
  { value: "business", label: "Doanh nghiệp" },
  { value: "commercial", label: "Xe kinh doanh vận tải" },
];

export default function ServiceDirectory() {
  const [activeFilter, setActiveFilter] = useState<DirectoryFilter>("all");

  const visibleServices = useMemo(() => {
    if (activeFilter === "all") return publicServices;
    if (activeFilter === "business") {
      return publicServices.filter((service) => service.audiences.includes("business"));
    }
    return publicServices.filter((service) => service.vehicles.includes(activeFilter));
  }, [activeFilter]);

  return (
    <div className="service-directory">
      <div className="service-filters" role="group" aria-label="Lọc danh sách dịch vụ">
        {filters.map((filter) => (
          <button
            key={filter.value}
            className={activeFilter === filter.value ? "service-filter is-active" : "service-filter"}
            type="button"
            aria-pressed={activeFilter === filter.value}
            onClick={() => setActiveFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {serviceCategories.map((category) => {
        const categoryServices = visibleServices.filter((service) => service.category === category.id);
        if (categoryServices.length === 0) return null;

        return (
          <section className="service-directory-group" id={category.id} key={category.id}>
            <header className="service-group-heading">
              <span className="icon-chip" aria-hidden="true">{category.icon}</span>
              <div>
                <h2>{category.name}</h2>
                <p>{category.description}</p>
              </div>
            </header>
            <div className="service-directory-grid">
              {categoryServices.map((service) => (
                <article className="service-directory-card" key={service.slug}>
                  <div>
                    <h3><Link href={`/${service.slug}`}>{service.name}</Link></h3>
                    <p>{service.intro}</p>
                  </div>
                  <Link className="service-card-link" href={`/${service.slug}`}>
                    Xem hồ sơ và quy trình <span aria-hidden="true">→</span>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

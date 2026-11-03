export default function PaginationClassic({
  data,
  itemsPerPage,
  currentPage,
  onPageChange,
}: {
  data: any[];
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages =
    data && data.length ? Math.ceil(data.length / itemsPerPage) : 0;

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <nav
        className="mb-4 sm:mb-0 sm:order-1"
        role="navigation"
        aria-label="Navigation"
      >
        <ul className="flex justify-center gap-3">
          {/* Previous */}
          <li>
            <button
              className={`btn btn-outline rounded-[20px] ${
                currentPage === 1
                  ? "text-app-gray-400 cursor-not-allowed"
                  : "text-primary-600 hover:border-app-gray-300"
              }`}
              onClick={handlePrevious}
              disabled={currentPage === 1}
            >
              ← Anterior
            </button>
          </li>

          {/* Next */}
          <li>
            <button
              className={`btn btn-outline rounded-[20px] ${
                currentPage === totalPages
                  ? "text-app-gray-400 cursor-not-allowed"
                  : "text-primary-700 hover:border-app-gray-300"
              }`}
              onClick={handleNext}
              disabled={currentPage === totalPages}
            >
              Siguiente →
            </button>
          </li>
        </ul>
      </nav>

      <div className="text-base font-normal text-app-gray-1-300 text-center sm:text-left">
        {data.length > 0
          ? `Mostrando ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(
              currentPage * itemsPerPage,
              data.length
            )} de ${data.length} resultados`
          : "No hay datos disponibles"}
      </div>
    </div>
  );
}
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  RegisterBody,
  RegisterBodyType,
} from "@/schemaValidations/auth.schema";
import authApiRequest from "@/api/auth";
import { toast } from "sonner";
import { handleErrorApi } from "@/lib/utils";

interface Ward {
  name: string;
}

interface ProvinceApiResponse {
  success: boolean;
  data: {
    province: string;
    wards: Ward[];
  };
}

const PROVINCES = [
  "Hà Nội",
  "Huế",
  "Hải Phòng",
  "Đà Nẵng",
  "Hồ Chí Minh",
  "Cần Thơ",
  "Tuyên Quang",
  "Lào Cai",
  "Thái Nguyên",
  "Phú Thọ",
  "Bắc Ninh",
  "Hưng Yên",
  "Ninh Bình",
  "Quảng Trị",
  "Quảng Ngãi",
  "Gia Lai",
  "Đắk Lắk",
  "Khánh Hòa",
  "Lâm Đồng",
  "Đồng Nai",
  "Tây Ninh",
  "Đồng Tháp",
  "An Giang",
  "Vĩnh Long",
  "Cà Mau",
  "Cao Bằng",
  "Lai Châu",
  "Điện Biên",
  "Sơn La",
  "Lạng Sơn",
  "Quảng Ninh",
  "Thanh Hóa",
  "Nghệ An",
  "Hà Tĩnh",
];

function RegisterForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [wards, setWards] = React.useState<Ward[]>([]);
  const [loadingWards, setLoadingWards] = React.useState(false);
  const [selectedProvince, setSelectedProvince] = React.useState("");
  const [selectedWard, setSelectedWard] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const form = useForm<RegisterBodyType>({
    resolver: zodResolver(RegisterBody),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      phone: "",
      address: "",
      dob: "",
    },
  });

  const fetchWards = async (province: string) => {
    setLoadingWards(true);
    try {
      const response = await fetch(
        `https://vietnamlabs.com/api/vietnamprovince?province=${encodeURIComponent(
          province
        )}`
      );
      const data: ProvinceApiResponse = await response.json();

      if (data.success) {
        setWards(data.data.wards);
      } else {
        setWards([]);
        toast.error("Failed to load wards for selected province");
      }
    } catch (error) {
      console.error("Error fetching wards:", error);
      setWards([]);
      toast.error("Failed to load wards");
    } finally {
      setLoadingWards(false);
    }
  };

  const handleProvinceChange = (province: string) => {
    setSelectedProvince(province);
    setSelectedWard("");
    form.setValue("address", province);
    setWards([]);
    fetchWards(province);
  };

  const handleWardChange = (ward: string) => {
    setSelectedWard(ward);
    const fullAddress = `${selectedProvince} - ${ward}`;
    form.setValue("address", fullAddress);
  };

  const handleHouseAddressChange = (houseAddress: string) => {
    let fullAddress = selectedProvince;
    if (selectedWard) {
      fullAddress = `${houseAddress}, ${selectedWard}, ${selectedProvince}`;
    } else {
      fullAddress = `${houseAddress}, ${selectedProvince}`;
    }
    form.setValue("address", fullAddress);
  };

  async function onSubmit(values: RegisterBodyType) {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      // Convert empty dob string to undefined
      const payload = {
        ...values,
        dob: values.dob && values.dob.trim() !== "" ? values.dob : undefined,
      };
      const result = await authApiRequest.register(payload);
      console.log("Registration result:", result);

      toast.success("Account created successfully!");
      router.push("/login");
    } catch (error: unknown) {
      handleErrorApi({
        error,
        setError: form.setError as any,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4">
          {/* Personal Information Section */}
          <div className="grid gap-3">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Password Section */}
          <div className="grid gap-3">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="********"
                        {...field}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="********"
                        {...field}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Optional Information Section */}
          <div className="grid gap-3">
            <h3 className="text-sm font-medium text-gray-500">
              Additional Information (Optional)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Province Selection */}
            <div>
              <label className="text-sm font-medium">Province/City</label>
              <Select
                onValueChange={handleProvinceChange}
                value={selectedProvince}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a province/city" />
                </SelectTrigger>
                <SelectContent>
                  {PROVINCES.map((province) => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ward Selection */}
            {selectedProvince && (
              <div>
                <label className="text-sm font-medium">Ward/District</label>
                <Select
                  onValueChange={handleWardChange}
                  value={selectedWard}
                  disabled={loadingWards}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        loadingWards
                          ? "Loading wards..."
                          : "Select a ward/district"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {wards.map((ward, index) => (
                      <SelectItem key={index} value={ward.name}>
                        {ward.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* House Address */}
            {selectedWard && (
              <div>
                <label className="text-sm font-medium">House Address</label>
                <Input
                  placeholder="Enter your house address (street, house number, etc.)"
                  onChange={(e) => handleHouseAddressChange(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Register"
          )}
        </Button>
      </form>
    </Form>
  );
}

export default RegisterForm;
